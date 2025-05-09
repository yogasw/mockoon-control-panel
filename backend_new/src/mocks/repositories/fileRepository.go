package repositories

import (
	"errors"
	"os"
	"path/filepath"
	"strings"

	"mockoon-control-panel/backend_new/src/lib"
	"mockoon-control-panel/backend_new/src/types"
	"mockoon-control-panel/backend_new/src/utils"
)

// FileRepository handles operations related to configuration files
type FileRepository struct{}

var FileRepo = new(FileRepository)

// GetConfigPath returns the absolute path to a configuration file
func (r *FileRepository) GetConfigPath(fileName string) string {
	// Sanitize the file name to prevent directory traversal
	safeName := strings.Replace(fileName, "..", "", -1)
	safeName = strings.Replace(safeName, "/", "", -1)
	safeName = strings.Replace(safeName, "\\", "", -1)

	return filepath.Join(lib.CONFIGS_DIR, safeName)
}

// ConfigExists checks if a configuration file exists
func (r *FileRepository) ConfigExists(fileName string) bool {
	configPath := r.GetConfigPath(fileName)
	return utils.FileExists(configPath)
}

// ListConfigs returns a list of available configuration files
func (r *FileRepository) ListConfigs() ([]types.ConfigFile, error) {
	files, err := os.ReadDir(lib.CONFIGS_DIR)
	if err != nil {
		return nil, err
	}

	var configs []types.ConfigFile
	for _, file := range files {
		// Skip directories and non-JSON files
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".json") {
			continue
		}

		fileInfo, err := file.Info()
		if err != nil {
			continue
		}

		configs = append(configs, types.ConfigFile{
			Name:      file.Name(),
			Path:      filepath.Join(lib.CONFIGS_DIR, file.Name()),
			Size:      fileInfo.Size(),
			ModTime:   fileInfo.ModTime(),
			IsRunning: false, // This will be updated elsewhere
		})
	}

	return configs, nil
}

// SaveConfigFromUpload saves an uploaded configuration file
func (r *FileRepository) SaveConfigFromUpload(uploadPath, fileName string) error {
	// Make sure the file exists
	if !utils.FileExists(uploadPath) {
		return errors.New("uploaded file not found")
	}

	// Sanitize the destination filename
	safeName := strings.Replace(fileName, "..", "", -1)
	safeName = strings.Replace(safeName, "/", "", -1)
	safeName = strings.Replace(safeName, "\\", "", -1)

	// Copy the file to the configs directory
	destPath := filepath.Join(lib.CONFIGS_DIR, safeName)
	return utils.CopyFile(uploadPath, destPath)
}

// DeleteConfig deletes a configuration file
func (r *FileRepository) DeleteConfig(fileName string) error {
	configPath := r.GetConfigPath(fileName)
	if !r.ConfigExists(fileName) {
		return errors.New("configuration file does not exist")
	}
	return os.Remove(configPath)
}

// ReadConfig reads the content of a configuration file
func (r *FileRepository) ReadConfig(fileName string) ([]byte, error) {
	configPath := r.GetConfigPath(fileName)
	if !r.ConfigExists(fileName) {
		return nil, errors.New("configuration file does not exist")
	}
	return os.ReadFile(configPath)
}
