package metrics

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/trace"
)

type NatsExporter struct {
	conn *nats.Conn
}

func (ne *NatsExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	for _, span := range spans {
		spanData := map[string]interface{}{
			"trace_id":   span.SpanContext().TraceID(),
			"span_id":    span.SpanContext().SpanID(),
			"name":       span.Name(),
			"start_time": span.StartTime(),
			"end_time":   span.EndTime(),
			"attributes": span.Attributes(),
		}

		msg, err := json.Marshal(spanData)
		if err != nil {
			log.Printf("Failed to serialize span: %v", err)
			return err
		}
		err = ne.conn.Publish("otel.spans", msg)
		if err != nil {
			return err
		}
	}
	return nil
}

func (ne *NatsExporter) Shutdown(ctx context.Context) error {
	return nil
}

func NewNatsTraceProvider(nc *nats.Conn) (*trace.TracerProvider, error) {

	natsExporter := &NatsExporter{nc}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(natsExporter,
			trace.WithBatchTimeout(time.Second)),
	)

	return traceProvider, nil
}

func SetupOTelSDK(ctx context.Context, nc *nats.Conn) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	shutdown = func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	tracerProvider, err := NewNatsTraceProvider(nc)
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	return
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

func newTraceProvider() (*trace.TracerProvider, error) {
	traceExporter, err := stdouttrace.New(
		stdouttrace.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			trace.WithBatchTimeout(time.Second)),
	)
	return traceProvider, nil
}

func newMeterProvider() (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// Default is 1m. Set to 3s for demonstrative purposes.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
