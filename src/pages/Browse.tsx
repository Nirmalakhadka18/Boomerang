import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Calendar, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Browse() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [selectedType, selectedCategory, selectedLocation, searchTerm]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from("items")
      .select(`
        *,
        profiles!user_id (full_name),
        categories (name)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (selectedType !== "all") {
      query = query.eq("type", selectedType);
    }

    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }

    if (selectedLocation !== "all") {
      query = query.eq("location_type", selectedLocation);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data } = await query;
    if (data) setItems(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Lost & Found Items</h1>
          <p className="text-muted-foreground">Search through items to find what you're looking for</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-soft)] mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No items found</p>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-[var(--shadow-medium)] transition-all"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <CardContent className="p-6">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                      {item.type === "lost" ? "Lost" : "Found"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {item.categories && (
                      <div className="flex items-center text-muted-foreground">
                        <Package className="h-4 w-4 mr-2" />
                        {item.categories.name}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {item.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(item.date_occurred).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
