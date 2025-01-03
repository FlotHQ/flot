package cmd

import (
	"os"

	"github.com/flothq/flot/core"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

func NewWorkerCommand(app core.App, showStartBanner bool) *cobra.Command {
	var natsURLS string = os.Getenv("FLOT_NATS_URL")

	command := &cobra.Command{
		Use:          "worker [domain(s)]",
		Args:         cobra.ArbitraryArgs,
		Short:        "Manage the worker",
		SilenceUsage: true,
	}

	startCommand := &cobra.Command{
		Use:          "start",
		Args:         cobra.ArbitraryArgs,
		Short:        "Starts the worker",
		SilenceUsage: true,
		RunE: func(command *cobra.Command, args []string) error {
			log.Info().
				Str("hello", "world").
				Msg("Hello World")

			log.Error().
				Str("Scale", "833 cents").
				Float64("Interval", 833.09).
				Msg("Fibonacci is everywhere")
			return nil
		},
	}

	if natsURLS == "" {
		startCommand.Flags().StringVar(
			&natsURLS,
			"nats-url",
			"",
			"NATS URLS to connect to (eg. nats://127.0.0.1:4222 or multiple nodes nats://127.0.0.1:4222,nats://127.0.0.1:4223,nats://127.0.0.1:4224)",
		)
		startCommand.MarkFlagRequired("nats-url")
	}

	stopCommand := &cobra.Command{
		Use:          "stop",
		Args:         cobra.ArbitraryArgs,
		Short:        "Stops the worker",
		SilenceUsage: true,
		RunE: func(command *cobra.Command, args []string) error {

			println("Stopping worker...")

			return nil
		},
	}

	restartCommand := &cobra.Command{
		Use:          "restart",
		Args:         cobra.ArbitraryArgs,
		Short:        "Restarts the worker",
		SilenceUsage: true,
		RunE: func(command *cobra.Command, args []string) error {

			println("Restarting worker...")

			return nil
		},
	}

	command.AddCommand(startCommand)
	command.AddCommand(stopCommand)
	command.AddCommand(restartCommand)

	return command
}
