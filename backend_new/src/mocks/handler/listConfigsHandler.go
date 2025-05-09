package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"mockoon-control-panel/backend_new/src/mocks/repositories"
)

// ListConfigsHandler handles requests to list available configuration files
func ListConfigsHandler(c *gin.Context) {
	configs, err := repositories.FileRepo.ListConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to list configuration files: " + err.Error(),
		})
		return
	}

	// Update running status for each config
	for i := range configs {
		running, port := repositories.MockInstanceRepo.IsRunningWithConfig(configs[i].Name)
		configs[i].IsRunning = running
		if running {
			configs[i].Port = port
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": configs,
	})
}
