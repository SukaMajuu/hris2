import { CheckIcon, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabledOptions?: string[];
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    { options, value = [], onChange, placeholder = "Select options", className, disabledOptions = [] },
    ref
  ) => {
    const [open, setOpen] = React.useState(false); const toggleOption = (optionValue: string) => {
      // Don't allow toggling disabled options
      if (disabledOptions.includes(optionValue)) {
        return;
      } const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    const handleSelectAll = () => {
      // Only include non-disabled options when selecting all
      const availableOptions = options.filter(option => !disabledOptions.includes(option.value));
      const availableValues = availableOptions.map(option => option.value);

      // Get currently selected available (non-disabled) options
      const selectedAvailableValues = value.filter(v => !disabledOptions.includes(v));

      // Get currently selected disabled options (these should persist)
      const selectedDisabledValues = value.filter(v => disabledOptions.includes(v));

      if (selectedAvailableValues.length === availableValues.length) {
        // If all available options are selected, deselect them but keep disabled ones
        onChange(selectedDisabledValues);
      } else {
        // Select all available options and keep disabled ones
        onChange([...selectedDisabledValues, ...availableValues]);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "flex w-full justify-between items-center text-left font-normal",
              className
            )}
          >
            <span className="truncate">
              {value.length > 0
                ? value.map(val => options.find(o => o.value === val)?.label).join(", ")
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]" align="start">
          <Command>
            <CommandList>              <CommandGroup>
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >                <div
                className={cn(
                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  (() => {
                    const availableOptions = options.filter(option => !disabledOptions.includes(option.value));
                    const availableValues = availableOptions.map(option => option.value);
                    const selectedAvailableValues = value.filter(v => !disabledOptions.includes(v));
                    return selectedAvailableValues.length === availableValues.length && availableValues.length > 0;
                  })()
                    ? "bg-primary text-primary-foreground"
                    : "opacity-50 [&_svg]:invisible"
                )}
              >
                  <CheckIcon className="h-4 w-4" />
                </div>
                <span>Select All</span>
              </CommandItem>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = disabledOptions.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className={cn(
                      "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isDisabled}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                        isDisabled && "border-gray-300 bg-gray-100"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span className={cn(isDisabled && "text-gray-400")}>
                      {option.label}
                      {isDisabled && " (Already selected)"}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";