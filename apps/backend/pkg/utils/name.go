package utils

import "strings"

// SplitDisplayName splits a display name into first and last names.
// If the name has 2 or more words, the last word becomes the last name.
// If the name has only 1 word, it becomes the first name and last name is nil.
func SplitDisplayName(displayName string) (firstName string, lastName *string) {
	parts := strings.Fields(displayName)
	if len(parts) == 0 {
		return "", nil
	}

	firstName = parts[0]
	if len(parts) > 1 {
		lastNameStr := strings.Join(parts[1:], " ")
		lastName = &lastNameStr
	}

	return firstName, lastName
}

// JoinDisplayName joins first and last names into a display name.
// If lastName is nil, it returns just the firstName.
func JoinDisplayName(firstName string, lastName *string) string {
	if lastName == nil {
		return firstName
	}
	return strings.TrimSpace(firstName + " " + *lastName)
}
