package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
	"gorm.io/gorm"
)

type workflowService struct {
	db     *gorm.DB
	logger zerolog.Logger
}

func NewWorkflowService(db *gorm.DB, logger zerolog.Logger) WorkflowService {
	return &workflowService{
		db:     db,
		logger: logger,
	}
}

func (s *workflowService) CreateWorkflow(ctx context.Context, userID string, name string) error {
	workflow := &Workflow{
		ID:        uuid.New().String(),
		UserID:    userID,
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.db.Create(workflow).Error; err != nil {
		return fmt.Errorf("failed to create workflow: %w", err)
	}

	return nil
}

func (s *workflowService) GetWorkflow(ctx context.Context, id string) (*Workflow, error) {
	var workflow Workflow
	if err := s.db.First(&workflow, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}
	return &workflow, nil
}

func (s *workflowService) ListWorkflows(ctx context.Context, userID string) ([]*Workflow, error) {
	var workflows []*Workflow
	if err := s.db.Where("user_id = ?", userID).Find(&workflows).Error; err != nil {
		return nil, fmt.Errorf("failed to list workflows: %w", err)
	}
	return workflows, nil
}

func (s *workflowService) DeleteWorkflow(ctx context.Context, id string) error {
	if err := s.db.Delete(&Workflow{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete workflow: %w", err)
	}
	return nil
}
