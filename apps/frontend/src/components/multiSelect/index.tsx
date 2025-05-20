import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectHariProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelectHari: React.FC<MultiSelectHariProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Pilih Hari",
}) => {
  const [open, setOpen] = useState(false);

  const isAllSelected = selected.length === options.length;

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span className={selected.length === 0 ? "text-muted-foreground" : ""}>
            {selected.length > 0
              ? options
                  .filter((o) => selected.includes(o.value))
                  .map((o) => o.label)
                  .join(", ")
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 space-y-2">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={toggleAll}
        >
          <div
            className={cn(
              "h-4 w-4 border rounded-sm flex items-center justify-center",
              isAllSelected ? "bg-primary text-primary-foreground" : "bg-white"
            )}
          >
            {isAllSelected && <CheckIcon className="w-4 h-4" />}
          </div>
          <span>Pilih Semua</span>
        </div>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <div
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => toggleOption(option.value)}
            >
              <div
                className={cn(
                  "h-4 w-4 border rounded-sm flex items-center justify-center",
                  checked ? "bg-primary text-primary-foreground" : "bg-white"
                )}
              >
                {checked && <CheckIcon className="w-4 h-4" />}
              </div>
              <span>{option.label}</span>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
