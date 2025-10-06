"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Laptop } from "./laptop-service";

const laptopFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  assigned_user: z.string().optional(),
  serial_number: z.string().min(1, {
    message: "Serial number is required.",
  }),
  asset_number: z.string().optional(),
  model_type: z.string().optional(),
  no_bast: z.string().optional(),
  date_received: z.date({
    required_error: "Date received is required.",
  }),
  condition: z.enum(["New", "Good", "Fair", "Damaged"], {
    required_error: "Condition is required.",
  }),
  notes: z.string().optional(),
  image_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
});

type LaptopFormValues = z.infer<typeof laptopFormSchema>;

interface LaptopFormProps {
  laptop?: Laptop;
  onSubmit: (data: LaptopFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function LaptopForm({ laptop, onSubmit, onCancel, isSubmitting }: LaptopFormProps) {
  const form = useForm<LaptopFormValues>({
    resolver: zodResolver(laptopFormSchema),
    defaultValues: {
      name: laptop?.name || "",
      assigned_user: laptop?.assigned_user || "",
      serial_number: laptop?.serial_number || "",
      asset_number: laptop?.asset_number || "",
      model_type: laptop?.model_type || "",
      no_bast: laptop?.no_bast || "",
      date_received: laptop?.date_received 
        ? (laptop.date_received instanceof Date 
            ? laptop.date_received 
            : new Date(laptop.date_received))
        : new Date(),
      condition: laptop?.condition as "New" | "Good" | "Fair" | "Damaged" || "Good",
      notes: laptop?.notes || "",
      image_url: laptop?.image_url || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laptop Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., MacBook Pro 14 M3" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned User</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., John Doe" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., ABC123XYZ" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asset_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., AS001" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Type</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., A2779" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="no_bast"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. BAST</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., BAST-001" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_received"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Received</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-11",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl className="flex-1">
                    <Input
                      placeholder="https://example.com/laptop-image.jpg"
                      className="h-8 w-50"
                      {...field}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Generate a random dummy image URL with laptop-related text
                      const laptopNames = ["MacBook Pro", "Lenovo Legion", "Lenovo Thinkpad", "Asus ROG", "Lenovo LOQ"];
                      const randomLaptop = laptopNames[Math.floor(Math.random() * laptopNames.length)];
                      const width = 400;
                      const height = 400;
                      const bgColor = "e2e8f0";
                      const textColor = "64748b";
                      const imageUrl = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(randomLaptop)}`;
                      form.setValue("image_url", imageUrl);
                    }}
                  >
                    Generate Dummy
                  </Button>
                </div>
                <FormDescription>
                  Enter the URL of the laptop image (optional) or click &quot;Generate Dummy&quot; for a placeholder
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional information..."
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : laptop ? (
              <>
                <span className="mr-2">✓</span>
                Update Laptop
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Laptop
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}