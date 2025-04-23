import { useState, ChangeEvent, FormEvent } from "react"; // Standard React imports
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCreateProperty } from "@/hooks/useProperty";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Added for step description
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added for field hints
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CloudUpload, MapPin, BedDouble, Bath, Users, Home, DollarSign, Image as ImageIcon, Sparkles, X, Check } from "lucide-react"; // Added Check icon
import ListingPreviewCard from "./ListingPreviewCard";
import { ScrollArea } from "@/components/ui/scroll-area"; // For amenity list

// Define validation schemas for each step
const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.string().min(1, "Please select a property type"),
  bedrooms: z.number().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.number().min(1, "Must have at least 1 bathroom"),
  maxGuests: z.number().min(1, "Must accommodate at least 1 guest"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

const step2Schema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const step3Schema = z.object({
  images: z.array(z.string()).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
});

const step4Schema = z.object({
  price: z.number().min(1, "Price must be at least 1"),
  cleaningFee: z.number().optional(),
  serviceFee: z.number().optional(),
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
});

// Combine all steps into the final schema, extending the base insert schema
const propertyFormSchema = insertPropertySchema.extend({
  title: step1Schema.shape.title,
  type: step1Schema.shape.type,
  bedrooms: step1Schema.shape.bedrooms,
  bathrooms: step1Schema.shape.bathrooms,
  maxGuests: step1Schema.shape.maxGuests,
  description: step1Schema.shape.description,
  address: step2Schema.shape.address,
  city: step2Schema.shape.city,
  country: step2Schema.shape.country,
  state: step2Schema.shape.state,
  zipCode: step2Schema.shape.zipCode,
  images: step3Schema.shape.images,
  price: step4Schema.shape.price,
  cleaningFee: step4Schema.shape.cleaningFee,
  serviceFee: step4Schema.shape.serviceFee,
  amenities: step4Schema.shape.amenities,
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface ListingWizardProps {
  open: boolean;
  onClose: () => void;
}

// Define amenity categories
const amenityCategories: Record<string, string[]> = {
  "Essentials": ["Wi-Fi", "Kitchen", "Air conditioning", "Heating", "Hot water", "TV", "Essentials (Towels, bed sheets, soap, toilet paper)"],
  "Features": ["Pool", "Gym", "Free parking", "BBQ area", "Hot tub", "EV charger", "Fireplace", "Washing machine", "Dryer"],
  "Location": ["Ocean view", "Mountain view", "City view", "Beach access", "Ski-in/Ski-out", "Waterfront"],
  "Safety": ["Smoke alarm", "Carbon monoxide alarm", "First aid kit", "Fire extinguisher"],
  "Accessibility": ["Step-free access", "Wide doorways", "Accessible bathroom features"],
  "Services": ["Breakfast included", "Airport shuttle", "Luggage dropoff allowed", "Long term stays allowed", "Self check-in (Smart lock/Keypad)"],
};

// Flatten all available amenities for the form validation
const allAvailableAmenities = Object.values(amenityCategories).flat();

const steps = [
  { id: 1, name: "Property Details", icon: Home, fields: Object.keys(step1Schema.shape) as (keyof PropertyFormValues)[] },
  { id: 2, name: "Location", icon: MapPin, fields: Object.keys(step2Schema.shape) as (keyof PropertyFormValues)[] },
  { id: 3, name: "Photos", icon: ImageIcon, fields: Object.keys(step3Schema.shape) as (keyof PropertyFormValues)[] },
  { id: 4, name: "Pricing & Amenities", icon: DollarSign, fields: Object.keys(step4Schema.shape) as (keyof PropertyFormValues)[] },
];

export default function ListingWizard({ open, onClose }: ListingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1); // Use standard useState
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutateAsync: createProperty, isPending: isSubmitting } = useCreateProperty();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema), // Use the combined schema for final validation
    mode: "onTouched", // Validate on blur
    defaultValues: {
      hostId: user?.id || 0,
      title: "",
      description: "",
      type: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      price: 0,
      cleaningFee: 0,
      serviceFee: 0,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: [],
      images: [],
    },
  });

  const watchedFormData = form.watch(); // Watch all form fields for preview

  // Mock image upload - Improved slightly
  const handleImageUpload = () => {
    const currentImages = form.getValues('images') || [];
    if (currentImages.length >= 10) {
        toast({ title: "Limit Reached", description: "You can upload a maximum of 10 images.", variant: "destructive" });
        return;
    }
    // Simulate upload delay
    form.setValue('images', [...currentImages, 'uploading'], { shouldValidate: true }); // Add a placeholder
    setTimeout(() => {
      const mockImageUrl = `https://source.unsplash.com/random/500x300?interior,house&sig=${Math.random()}`;
      const updatedImages = form.getValues('images')?.filter(img => img !== 'uploading') || [];
      form.setValue("images", [...updatedImages, mockImageUrl], { shouldValidate: true, shouldDirty: true });
    }, 1500); // Simulate 1.5 second upload
  };

  // Handle amenity selection directly with react-hook-form
  const handleAmenityChange = (amenity: string, checked: boolean | 'indeterminate') => {
    const currentAmenities = form.getValues("amenities") || [];
    const updatedAmenities = checked === true
      ? [...currentAmenities, amenity]
      : currentAmenities.filter((a) => a !== amenity);
    form.setValue("amenities", updatedAmenities, { shouldValidate: true, shouldDirty: true });
  };

  // Remove an uploaded image
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    form.setValue("images", updatedImages, { shouldValidate: true });
  };

  const processStep = async () => {
    const fieldsToValidate = steps[currentStep - 1].fields;
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      // Find the first field with an error in the current step and focus it
      const firstErrorField = fieldsToValidate.find(field => form.formState.errors[field]);
      if (firstErrorField) {
        form.setFocus(firstErrorField);
      }
      return; // Stop if validation fails
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission if on the last step
      await form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    if (!user?.id) {
      toast({ title: "Authentication Error", description: "Please log in to create a listing.", variant: "destructive" });
      return;
    }
    try {
      const propertyData = {
        ...values,
        hostId: user.id,
        // Prepare data, ensuring types match the final schema before validation/submission
        cleaningFee: values.cleaningFee ? Number(values.cleaningFee) : null,
        serviceFee: values.serviceFee ? Number(values.serviceFee) : null,
        state: values.state || null, // Ensure null if empty/undefined
        zipCode: values.zipCode || null, // Ensure null if empty/undefined
        price: Number(values.price),
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        maxGuests: Number(values.maxGuests),
      };

      // Use the combined schema for final validation before submitting
      const validationResult = propertyFormSchema.safeParse(propertyData);
      if (!validationResult.success) {
          console.error("Final validation failed:", validationResult.error.flatten());
          toast({ title: "Validation Error", description: "Please check all fields.", variant: "destructive" });
          // Optionally highlight errors across all steps
          return;
      }

      await createProperty(validationResult.data); // Submit validated data

      toast({
        title: "Listing Created!",
        description: "Your property is now live.",
        variant: "success",
      });

      onClose(); // Close the dialog
      form.reset(); // Reset form fields
      setCurrentStep(1); // Go back to the first step

      if (!user?.isHost) {
        // Consider a more sophisticated state update than reload
        window.location.reload();
      }
    } catch (error) {
      console.error("Listing creation error:", error);
      toast({
        title: "Listing Error",
        description: "Could not create listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Property Details
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Cozy Downtown Apartment" {...field} /></FormControl>
                  <FormDescription>A catchy title helps attract guests.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Guest suite">Guest suite</SelectItem>
                      <SelectItem value="Loft">Loft</SelectItem>
                      <SelectItem value="Condominium">Condominium</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Hotel Room">Hotel Room</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <Select onValueChange={(v: string) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((n: number) => <SelectItem key={n} value={String(n)}>{n === 0 ? "Studio" : n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                     <Select onValueChange={(v: string) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((n: number) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <Select onValueChange={(v: string) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((n: number) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Tell guests about your space..." className="resize-none" rows={5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2: // Location
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="e.g., Dubai" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Dubai" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="e.g., United Arab Emirates" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip / Postal Code (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., 00000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormDescription>Your exact address is only shared with confirmed guests.</FormDescription>
          </div>
        );
      case 3: // Photos
        const images = form.watch("images") || [];
        return (
          <div className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary transition-colors">
              <div className="mx-auto h-12 w-12 text-slate-400">
                <CloudUpload className="h-12 w-12" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-slate-600">Drag and drop photos here or</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleImageUpload} className="mt-2">
                Upload from device
              </Button>
              <p className="text-xs text-slate-500 mt-2">Minimum 1, maximum 10 photos. Use high-quality images.</p>
            </div>
            <FormField
              control={form.control}
              name="images"
              render={() => ( <FormMessage className="text-center" /> )} // Display validation message centrally
            />
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative bg-slate-100 rounded-lg aspect-video group">
                    {image === 'uploading' ? (
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        <img src={image} alt={`Property photo ${index + 1}`} className="h-full w-full object-cover rounded" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 4: // Pricing & Amenities
        const currentAmenities = form.watch("amenities") || [];
        return (
          <div className="space-y-8">
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Nightly Rate (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-slate-400" /></div>
                      <Input type="number" className="pl-8" placeholder="100" {...field} onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cleaningFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Fee (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-slate-400" /></div>
                        <Input type="number" className="pl-8" placeholder="50" {...field} onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Fee (Optional)</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-slate-400" /></div>
                        <Input type="number" className="pl-8" placeholder="25" {...field} onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Amenities</h3>
              <FormField
                control={form.control}
                name="amenities"
                render={() => ( <FormMessage className="mb-4" /> )} // Display validation message
              />
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-6">
                  {Object.entries(amenityCategories).map(([category, amenities]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold mb-2 text-slate-600">{category}</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${amenity}`}
                              checked={currentAmenities.includes(amenity)}
                              onCheckedChange={(checked: boolean | 'indeterminate') => handleAmenityChange(amenity, checked)}
                            />
                            <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">{amenity}</Label> {/* Added cursor-pointer */}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] lg:max-w-[1200px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create your listing ({currentStep}/{steps.length})</DialogTitle>
          <DialogDescription>
            {steps[currentStep - 1].name}: Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="px-1 pt-2 pb-6 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <>
                <div key={step.id} className="flex flex-col items-center text-center w-1/4">
                   <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white text-slate-500'}`}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                  </div>
                  <div className={`mt-1 text-xs font-medium ${currentStep >= step.id ? 'text-primary' : 'text-slate-500'}`}>{step.name}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* Grid layout for form and preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start overflow-hidden flex-1 py-6">
          {/* Form Section */}
          {/* Form Section - Wrap form content inside Form */}
          <ScrollArea className="h-full pr-6">
            {/* The <Form> component from shadcn/ui wraps react-hook-form's FormProvider */}
            <Form {...form}>
              <form onSubmit={(e: FormEvent) => e.preventDefault()} className="space-y-8">
                {renderStepContent()}
              </form>
            </Form>
          </ScrollArea>

          {/* Preview Section */}
          <div className="hidden md:block sticky top-0 h-full overflow-y-auto">
             <h3 className="text-lg font-medium mb-4 text-center">Live Preview</h3>
            <ListingPreviewCard formData={watchedFormData} />
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-auto pt-4 border-t sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={processStep} // Use processStep for validation and navigation/submission
            disabled={isSubmitting}
          >
            {isSubmitting ? (currentStep === steps.length ? "Publishing..." : "Saving...") : (currentStep === steps.length ? "Publish Listing" : "Continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
