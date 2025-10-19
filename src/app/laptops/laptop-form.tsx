"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, RefreshCw, Image as ImageIcon, X } from "lucide-react";

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
import { useState, ChangeEvent } from "react";
import { DragDropImageUpload } from "./drag-drop-image-upload";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

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

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadStatus('Please select an image file');
      return;
    }
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('File size exceeds 5MB limit');
      return;
    }
    
    setSelectedFile(file);
    setUploadStatus(null);
    
    // Automatically start upload
    handleImageUpload(file);
  };

  const handleImageUpload = async (fileToUpload: File = selectedFile!) => {
    if (!fileToUpload) {
      setUploadStatus('Please select an image file first');
      return;
    }

    // Generate a temporary laptop ID for new laptops
    const laptopId = laptop?.id || `temp_${Date.now().toString(36) + Math.random().toString(36).substr(2, 5)}`;
    
    setIsUploading(true);
    setUploadStatus('Starting upload...');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('laptopId', laptopId);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const requestPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', '/api/laptops/upload');
      xhr.send(formData);

      const result = await requestPromise as { url: string };
      form.setValue("image_url", result.url);
      setUploadStatus('Image uploaded successfully!');
      setSelectedFile(null);
    } catch (error: any) {
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", "");
    setSelectedFile(null);
    setUploadStatus(null);
  };

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
              <FormItem className="md:col-span-2">
                <FormLabel>Image</FormLabel>
                <DragDropImageUpload
                  onImageUpload={field.onChange}
                  onImageFileSelect={handleFileSelection}
                  currentImageUrl={field.value}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  uploadStatus={uploadStatus}
                />
                
                {/* Generate dummy button */}
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Generate a random dummy image URL with laptop-related text
                      const laptopNames = ["Laptop", "Laptop", "Laptop", "Laptop", "Laptop"];
                      const randomLaptop = laptopNames[Math.floor(Math.random() * laptopNames.length)];
                      const width = 400;
                      const height = 400;
                      const bgColor = "e2e8f0";
                      const textColor = "64748b";
                      const imageUrl = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(randomLaptop)}`;
                      form.setValue("image_url", imageUrl);
                      setUploadStatus(null);
                      setSelectedFile(null);
                    }}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Dummy Image
                  </Button>
                  <FormDescription className="mt-2">
                    Drag and drop an image file, paste from clipboard (Ctrl+V), or use the "Generate Dummy" option for a placeholder
                  </FormDescription>
                </div>
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
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
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