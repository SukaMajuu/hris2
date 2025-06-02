package utils

import (
	"strings"
	"time"
)

// ParseTimeHelper parses a string in HH:MM:SS or HH:MM format to *time.Time.
// It returns nil if the input string is nil, empty, or parsing fails.
func ParseTimeHelper(timeStr *string) *time.Time {
	if timeStr == nil || *timeStr == "" {
		return nil
	}

	layouts := []string{"15:04:05", "15:04"} // HH:MM:SS and HH:MM
	var parsedTime time.Time
	var err error

	for _, layout := range layouts {
		parsedTime, err = time.Parse(layout, *timeStr)
		if err == nil {
			// To store only the time part, we can create a new time.Time
			// with a zero date but with the parsed hour, minute, and second.
			// However, time.Time in Go always includes a date.
			// The database 'time' type usually handles this correctly.
			// For consistency, we return the parsed time directly.
			// If only HH:MM is provided, seconds will be 0.
			return &parsedTime
		}
	}
	// If parsing fails with all layouts, return nil
	// Optionally, log the error: log.Printf("Failed to parse time string '%s': %v", *timeStr, err)
	return nil
}

// StringToDays converts a slice of day strings to a slice of domain.Days.
// Invalid day strings are ignored.
func StringToDays(dayStrings []string) []string {
	// Note: This function previously returned []domain.Days, but domain.Days is not accessible here.
	// It should return []string, and the conversion to domain.Days should happen where domain types are accessible.
	// Or, the domain.Days type definition should be moved to a more common package if it's widely used.
	// For now, returning []string to avoid direct dependency on a specific domain.Days type here.
	// The handler will need to cast these strings to domain.Days.
	var validDays []string
	validDayMap := map[string]bool{
		"Monday":    true,
		"Tuesday":   true,
		"Wednesday": true,
		"Thursday":  true,
		"Friday":    true,
		"Saturday":  true,
		"Sunday":    true,
	}
	for _, dayStr := range dayStrings {
		trimmedDay := strings.TrimSpace(dayStr)
		if _, ok := validDayMap[trimmedDay]; ok {
			validDays = append(validDays, trimmedDay)
		}
	}
	return validDays
}
