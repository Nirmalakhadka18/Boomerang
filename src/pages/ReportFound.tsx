import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { z } from "zod";

const reportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(3, "Location is required").max(200),
  locationType: z.enum(["school", "office", "public"]),
  dateOccurred: z.string().min(1, "Date is required"),
});

export default function ReportFound() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to report a found item",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("item-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      color: formData.get("color") as string,
      location: formData.get("location") as string,
      locationType: formData.get("locationType") as string,
      dateOccurred: formData.get("dateOccurred") as string,
    };

    try {
      reportSchema.parse(data);

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("items").insert({
        user_id: user.id,
        type: "found",
        title: data.title,
        description: data.description,
        category_id: data.category,
        color: data.color,
        location: data.location,
        location_type: data.locationType,
        date_occurred: data.dateOccurred,
        image_url: imageUrl,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Item reported!",
        description: "Your found item has been posted. The owner can now contact you.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to report item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Report a Found Item</CardTitle>
            <CardDescription>
              Help reunite someone with their belongings by posting what you found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Name *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Black iPhone 13"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide details like brand, special marks, or unique features..."
                  required
                  maxLength={1000}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="e.g., Black, Blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Where Found *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Library, Cafeteria, Building A Room 101"
                  required
                  maxLength={200}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type *</Label>
                  <Select name="locationType" required>
                    <SelectTrigger id="locationType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOccurred">Date Found *</Label>
                  <Input
                    id="dateOccurred"
                    name="dateOccurred"
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-full max-w-xs rounded-lg" />
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Submitting..." : "Report Found Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
