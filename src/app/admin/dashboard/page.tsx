"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import { uploadImageToSupabase } from "@/lib/supabase/storage";
import { uploadGalleryImageToSupabase } from "@/lib/supabase/gallery-upload";
import { uploadDocumentToSupabase } from "@/lib/supabase/document-upload";
import ImageManager from "@/components/ImageManager";
import DocumentManager from "@/app/admin/DocumentManager";
import GalleryManager from "@/app/admin/GalleryManager";
import StorageTracker from "@/components/StorageTracker";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      // Check if there's a saved active tab in localStorage
      const savedTab = localStorage.getItem("adminActiveTab");
      // Only return saved tab if it's valid, otherwise default to 'home'
      return savedTab &&
        [
          "home",
          "about",
          "skills",
          "projects",
          "gallery",
          "documents",
          "images",
          "users",
        ].includes(savedTab)
        ? savedTab
        : "home";
    }
    return "home"; // Default to home on initial load
  });
  const [homeData, setHomeData] = useState({
    name: "",
    title: "",
    about: "",
    image: "",
    skills: [] as string[],
    location: "",
    phone: "",
    careerFocus: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // State to hold categories from Supabase storage
  const [categories, setCategories] = useState<string[]>([]);

  // State for data management sections
  const [aboutData, setAboutData] = useState({
    name: "",
    title: "",
    about: "",
    image: "",
    location: "",
    phone: "",
    careerFocus: "",
    email: "",
    education: [] as Array<{
      id: number;
      school: string;
      degree: string;
      period: string;
      description: string;
    }>,
    experiences: [] as Array<{
      id: number;
      title: string;
      company: string;
      period: string;
      description: string;
    }>,
    certifications: [] as Array<{
      id: number;
      title: string;
      description: string;
    }>,
  });
  const [skillsData, setSkillsData] = useState({
    skillCategories: [
      {
        title: "⭐ Web Development",
        skills: [
          { name: "Next.js", level: 90 },
          { name: "React", level: 85 },
          { name: "TypeScript", level: 80 },
          { name: "Tailwind CSS", level: 95 },
          { name: "Supabase", level: 75 },
          { name: "Prisma", level: 70 },
          { name: "PostgreSQL", level: 75 },
          { name: "Git/GitHub", level: 85 },
          { name: "Vercel", level: 80 },
        ],
      },
      {
        title: "⭐ Data Analysis",
        skills: [
          { name: "Python", level: 85 },
          { name: "Pandas", level: 80 },
          { name: "NumPy", level: 75 },
          { name: "SQL", level: 80 },
          { name: "Excel", level: 85 },
          { name: "Data Visualization", level: 70 },
        ],
      },
      {
        title: "⭐ IT Support & Systems",
        skills: [
          { name: "Networking Basics", level: 75 },
          { name: "Troubleshooting", level: 85 },
          { name: "Database Management", level: 80 },
          { name: "Operating Systems", level: 80 },
          { name: "System Administration", level: 70 },
        ],
      },
    ],
    additionalSkills: [
      "JavaScript",
      "HTML5/CSS3",
      "RESTful APIs",
      "Responsive Design",
      "CI/CD",
      "Testing",
      "Agile Methodology",
      "Project Management",
    ],
  });
  const [projectsData, setProjectsData] = useState(
    [] as Array<{
      id: number;
      title: string;
      description: string;
      link: string;
      stack: string[];
      category: string;
    }>
  );
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [bulkUploadCategory, setBulkUploadCategory] = useState("");
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [documentsData, setDocumentsData] = useState(
    [] as Array<{
      id: number;
      title: string;
      file: string;
      description: string;
      category?: string;
    }>
  );

  // User management state
  const [users, setUsers] = useState<Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>>([]);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name?: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // Helper function to update active tab in state and localStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminActiveTab", tab);
    }
  };

  // --- API FETCH FUNCTIONS ---

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const fetchedCategories: string[] = await response.json();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/home");

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          const errorText = await response.text();
          throw new Error(
            `Server error: ${response.status} - ${
              errorText || "Internal server error"
            }`
          );
        }
        throw new Error("Failed to fetch home data");
      }

      const data = await response.json();
      setHomeData(data);
    } catch (error) {
      console.error("Error fetching home data:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load home data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryData = async () => {
    try {
      // Create Supabase client for browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // List all items in the 'gallery' folder and subfolders from Supabase storage
      const { data: topLevelItems, error: topLevelError } = await supabase.storage
        .from('Images') // Using the Images bucket
        .list('gallery/', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (topLevelError) {
        console.error('Error fetching top-level gallery items from Supabase storage:', topLevelError);
        throw new Error("Failed to fetch gallery data from storage");
      }

      const galleryItemsFromStorage = [];

      // Process top-level items (both files and folders in gallery/)
      if (topLevelItems) {
        for (const item of topLevelItems) {
          if (item.type === 'folder') {
            // This is a folder - list its contents to get the actual gallery items
            const { data: folderContents, error: folderError } = await supabase.storage
              .from('Images')
              .list(`gallery/${item.name}/`, {
                limit: 1000,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
              });

            if (folderError) {
              console.error(`Error fetching contents of folder ${item.name}:`, folderError);
              continue;
            }

            if (folderContents) {
              // Create gallery items for each file in the folder
              for (const folderFile of folderContents) {
                if (folderFile.type !== 'folder') { // Only include actual files, not subfolders
                  const { data: { publicUrl } } = supabase.storage
                    .from('Images')
                    .getPublicUrl(`gallery/${item.name}/${folderFile.name}`);

                  galleryItemsFromStorage.push({
                    id: Date.now() + Math.floor(Math.random() * 10000) + galleryItemsFromStorage.length, // Generate temporary ID
                    src: publicUrl,
                    alt: folderFile.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
                    category: item.name, // Use folder name as category
                    name: folderFile.name,
                    type: 'file'
                  });
                }
              }
            }
          } else {
            // This is a file directly in the gallery folder
            const { data: { publicUrl } } = supabase.storage
              .from('Images')
              .getPublicUrl(`gallery/${item.name}`);

            galleryItemsFromStorage.push({
              id: Date.now() + Math.floor(Math.random() * 10000) + galleryItemsFromStorage.length, // Generate unique ID
              src: publicUrl,
              alt: item.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
              category: 'General', // For files directly in gallery folder
              name: item.name,
              type: 'file'
            });
          }
        }
      }

      // Set the gallery data from storage
      if (galleryItemsFromStorage && galleryItemsFromStorage.length > 0) {
        setGalleryData(galleryItemsFromStorage);
      } else {
        // If no gallery items found, initialize with an empty array
        setGalleryData([]);
      }
    } catch (error) {
      console.error("Error fetching gallery data from storage:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load gallery data from storage");
      }
    }
  };

  const fetchAboutData = async () => {
    try {
      const response = await fetch("/api/admin/about");

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          const errorText = await response.text();
          throw new Error(
            `Server error: ${response.status} - ${
              errorText || "Internal server error"
            }`
          );
        }
        throw new Error("Failed to fetch about data");
      }

      let data = await response.json();

      // Ensure all certification IDs are unique to prevent React key collisions
      if (data.certifications && Array.isArray(data.certifications)) {
        const uniqueCerts = data.certifications.map((cert, index) => ({
          ...cert,
          // Use a unique ID by combining the original ID with index position to avoid duplicates
          id: cert.id ? cert.id * 1000000 + index : Date.now() + index, // If no ID exists, use timestamp + index
        }));

        data = {
          ...data,
          certifications: uniqueCerts,
        };
      }

      setAboutData(data);
    } catch (error) {
      console.error("Error fetching about data:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load about data");
      }
    }
  };

  const fetchProjectsData = async () => {
    try {
      const response = await fetch("/api/admin/projects");

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          const errorText = await response.text();
          throw new Error(
            `Server error: ${response.status} - ${
              errorText || "Internal server error"
            }`
          );
        }
        throw new Error("Failed to fetch projects data");
      }

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setProjectsData(data);
      }
    } catch (error) {
      console.error("Error fetching projects data:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load projects data");
      }
    }
  };

  const fetchSkillsData = async () => {
    try {
      const response = await fetch("/api/admin/skills");

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          const errorText = await response.text();
          throw new Error(
            `Server error: ${response.status} - ${
              errorText || "Internal server error"
            }`
          );
        }
        throw new Error("Failed to fetch skills data");
      }

      const data = await response.json();
      if (data) {
        setSkillsData(data);
      }
    } catch (error) {
      console.error("Error fetching skills data:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load skills data");
      }
    }
  };

  const fetchDocumentsData = async () => {
    try {
      // Create Supabase client for browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // List all items in the rootdocs folder and subfolders from Supabase storage
      const { data: topLevelItems, error: topLevelError } = await supabase.storage
        .from('Images') // Using the Images bucket
        .list('rootdocs/', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (topLevelError) {
        console.error('Error fetching top-level documents from Supabase storage:', topLevelError);
        throw new Error("Failed to fetch documents from storage");
      }

      const documentsFromStorage = [];

      // Process top-level items (both files and folders in rootdocs/)
      if (topLevelItems) {
        for (const item of topLevelItems) {
          if (item.type === 'folder') {
            // This is a folder - list its contents to get the actual documents
            const { data: folderContents, error: folderError } = await supabase.storage
              .from('Images')
              .list(`rootdocs/${item.name}/`, {
                limit: 1000,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
              });

            if (folderError) {
              console.error(`Error fetching contents of folder ${item.name}:`, folderError);
              continue;
            }

            if (folderContents) {
              // Create document entries for each file in the folder
              for (const folderFile of folderContents) {
                if (folderFile.type !== 'folder') { // Only include actual files, not subfolders
                  const { data: { publicUrl } } = supabase.storage
                    .from('Images')
                    .getPublicUrl(`rootdocs/${item.name}/${folderFile.name}`);

                  documentsFromStorage.push({
                    id: Date.now() + Math.floor(Math.random() * 10000) + documentsFromStorage.length, // Generate temporary ID
                    title: folderFile.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
                    file: publicUrl,
                    description: `Document in ${item.name} folder`,
                    category: item.name, // Use folder name as category
                  });
                }
              }
            }
          } else {
            // This is a file directly in the rootdocs folder
            const { data: { publicUrl } } = supabase.storage
              .from('Images')
              .getPublicUrl(`rootdocs/${item.name}`);

            documentsFromStorage.push({
              id: Date.now() + Math.floor(Math.random() * 10000) + documentsFromStorage.length, // Generate unique ID
              title: item.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
              file: publicUrl,
              description: 'Document in root folder',
              category: 'rootdocs', // For files directly in rootdocs folder
            });
          }
        }
      }

      // Set the documents data from storage
      if (documentsFromStorage && documentsFromStorage.length > 0) {
        setDocumentsData(documentsFromStorage);
      } else {
        // If no documents found, initialize with an empty array
        setDocumentsData([]);
      }
    } catch (error) {
      console.error("Error fetching documents data from storage:", error);
      if (error.message.includes("Network error")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load documents data from storage");
      }
    }
  };


  // --- UPLOAD HANDLERS ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImageToSupabase(file, "profile-images", "");

      if (result.success && result.url) {
        // Extract the path from the full URL so it can be properly reconstructed by the SupabaseImage component
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && result.url.startsWith(supabaseUrl)) {
          // Extract the path after the supabase URL
          const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
          const imagePath = result.url.replace(pathStart, "");
          setHomeData((prev) => ({ ...prev, image: imagePath }));
        } else {
          // If the URL doesn't start with our SUPABASE_URL, it might already be a path
          setHomeData((prev) => ({ ...prev, image: result.url }));
        }
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error && error.message.includes("Network")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (
        error instanceof Error &&
        error.message.includes("Server error")
      ) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAboutImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImageToSupabase(file, "profile-images", "");

      if (result.success && result.url) {
        // Extract the path from the full URL so it can be properly reconstructed by the SupabaseImage component
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && result.url.startsWith(supabaseUrl)) {
          // Extract the path after the supabase URL
          const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
          const imagePath = result.url.replace(pathStart, "");
          setAboutData((prev) => ({ ...prev, image: imagePath }));
        } else {
          // If the URL doesn't start with our SUPABASE_URL, it might already be a path
          setAboutData((prev) => ({ ...prev, image: result.url }));
        }
        toast.success("Profile image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("About image upload error:", error);
      if (error instanceof Error && error.message.includes("Network")) {
        toast.error(
          "No internet connection. Please check your network and try again."
        );
      } else if (
        error instanceof Error &&
        error.message.includes("Server error")
      ) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerAboutFileSelect = () => {
    aboutFileInputRef.current?.click();
  };


  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Get the category for this gallery item
    const category = galleryData[index]?.category || "uncategorized";

    // Before uploading, ensure the category exists in the categories state
    if (!categories.includes(category) && category !== "uncategorized") {
      setCategories((prev) => [...new Set([...prev, category])]); // Add new category to state if not exists
    }

    setUploading(true);
    try {
      // Upload gallery image organized by category
      const result = await uploadGalleryImageToSupabase(file, category);

      if (result.success && result.url) {
        // Extract the image name from the file for alt text (without extension)
        const imageName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

        // Update the specific gallery item with the new image URL and auto-generated alt text
        const updatedGallery = [...galleryData];
        updatedGallery[index] = {
          ...updatedGallery[index],
          src: result.url,
          alt: imageName, // Automatically set alt text to image name without extension
        };
        setGalleryData(updatedGallery);
        toast.success("Gallery image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload gallery image");
      }
    } catch (error) {
      console.error("Gallery upload error:", error);
      toast.error("Failed to upload gallery image");
    } finally {
      setUploading(false);
    }
  };

  // Bulk upload functions
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBulkUploadFiles(files);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFiles.length) {
      toast.error("Please select files to upload");
      return;
    }

    if (!bulkUploadCategory.trim()) {
      toast.error("Please enter a category for the images");
      return;
    }

    setIsBulkUploading(true);
    try {
      // Track successful uploads to add to gallery data
      const successfulUploads = [];

      for (const file of bulkUploadFiles) {
        // Upload each file to the specified category folder
        const result = await uploadGalleryImageToSupabase(
          file,
          bulkUploadCategory
        );

        if (result.success && result.url) {
          // Extract image name from file for alt text
          const imageName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

          successfulUploads.push({
            src: result.url,
            alt: imageName,
            category: bulkUploadCategory,
            id: galleryData.length + successfulUploads.length + 1,
          });
        } else {
          console.error(`Failed to upload ${file.name}:`, result.error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Add successful uploads to the gallery data
      if (successfulUploads.length > 0) {
        setGalleryData((prev) => [...prev, ...successfulUploads]);
        toast.success(
          `Successfully uploaded ${successfulUploads.length} images!`
        );
        // Clear the form
        setBulkUploadFiles([]);
        setBulkUploadCategory("");
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error("Bulk upload failed");
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Function to get unique categories (combines existing gallery items, documents and fetched categories from storage)
  const getUniqueCategories = () => {
    // Get categories from current gallery items
    const galleryItemCategories = new Set(
      galleryData.map((item) => item.category)
    );
    // Remove empty/undefined gallery categories
    galleryItemCategories.delete("");
    galleryItemCategories.delete(undefined as any);
    galleryItemCategories.delete(null as any);

    // Get categories from current documents
    const documentItemCategories = new Set(
      documentsData.map((item) => item.category)
    );
    // Remove empty/undefined document categories
    documentItemCategories.delete("");
    documentItemCategories.delete(undefined as any);
    documentItemCategories.delete(null as any);

    // Combine all categories
    const combinedCategories = new Set([
      ...galleryItemCategories,
      ...documentItemCategories,
      ...categories,
    ]);
    return Array.from(combinedCategories).sort();
  };

  // --- DOCUMENTS TAB FUNCTIONS ---
  const handleCertificateChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setAboutData((prev) => {
      const updatedCerts = [...prev.certifications];
      updatedCerts[index] = { ...updatedCerts[index], [field]: value };
      return { ...prev, certifications: updatedCerts };
    });
  };

  const handleDocumentChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setDocumentsData((prevDocuments) => {
      const updatedDocuments = [...prevDocuments];
      updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };
      return updatedDocuments;
    });
  };

  const handleAddCertificate = () => {
    setAboutData((prev) => {
      // Generate a unique ID using a combination of timestamp and random value to prevent conflicts
      const uniqueId =
        Date.now() +
        Math.floor(Math.random() * 10000) +
        prev.certifications.length * 1000000;

      const newCert = {
        id: uniqueId,
        title: "New Certificate",
        description: "Description of the certificate",
        file: "", // Initially no file
      };

      return {
        ...prev,
        certifications: [...prev.certifications, newCert],
      };
    });
  };

  const handleAddDocument = () => {
    setDocumentsData((prevDocuments) => {
      // Calculate next ID based on the highest existing ID + 1 to ensure uniqueness
      const nextId =
        prevDocuments.length > 0
          ? Math.max(...prevDocuments.map((doc) => doc.id)) + 1
          : 1;

      const newDocument = {
        id: nextId,
        title: "New Document",
        file: "/documents/new-doc.pdf",
        description: "Description of the new document",
        isNew: true, // Add a flag to indicate this is a new document
      };
      // Prepend the new document to the beginning of the array
      return [newDocument, ...prevDocuments];
    });
  };

  const handleRemoveCertificate = (index: number) => {
    if (
      confirm(
        "Are you sure you want to delete this certificate? This will remove both the record and the file from storage."
      )
    ) {
      const certToDelete = aboutData.certifications[index];
      setAboutData((prev) => {
        const updatedCerts = [...prev.certifications];
        updatedCerts.splice(index, 1);
        return { ...prev, certifications: updatedCerts };
      });

      // Call API to delete from DB and storage
      if (certToDelete.id) {
        fetch("/api/admin/certificates", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: certToDelete.id,
            file: certToDelete.file,
          }),
        }).then((response) => {
          if (response.ok) {
            toast.success("Certificate deleted successfully");
          } else {
            toast.error("Failed to delete certificate from storage");
          }
        });
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentsData((prevDocuments) =>
      prevDocuments.filter((_, i) => i !== index)
    );
  };


  // Function to handle user update (email and password)
  const handleUserUpdate = async () => {
    if (!selectedUser) {
      toast.error("No user selected for update");
      return;
    }

    // Validate that the ID is a valid number
    const userId = Number(selectedUser.id);
    if (isNaN(userId) || userId <= 0) {
      toast.error("Invalid user ID");
      console.error("Invalid user ID:", selectedUser.id);
      return;
    }

    try {
      setSaving(true);

      // Prepare the payload - only send changed values
      const payload: { email?: string; password?: string; role?: string } = {};
      if (selectedUser.email) payload.email = selectedUser.email;
      if (selectedUser.password) payload.password = selectedUser.password; // Password will be hashed on the server
      if (selectedUser.role) payload.role = selectedUser.role;

      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 0) {
          // Network error (no connection)
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          // Server error
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      toast.success("User updated successfully!");

      // Refresh the users list
      await fetchUsersData();
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.message.includes("Network error")) {
        toast.error("No internet connection. Please check your network and try again.");
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  };

  // Function to handle user selection for editing
  const handleSelectUser = (user: { id: number; name: string; email: string; role: string }) => {
    setSelectedUser({
      id: Number(user.id), // Ensure ID is a number
      name: user.name,
      email: user.email,
      password: "", // Don't include existing password for security
      role: user.role,
    });
  };

  // Profile image upload function (for home page)
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImageToSupabase(file, "profile-images", "");

      if (result.success && result.url) {
        // Extract the path from the full URL so it can be properly reconstructed by the SupabaseImage component
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && result.url.startsWith(supabaseUrl)) {
          // Extract the path after the supabase URL
          const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
          const imagePath = result.url.replace(pathStart, "");
          setHomeData(prev => ({ ...prev, image: imagePath }));
        } else {
          // If the URL doesn't start with our SUPABASE_URL, it might already be a path
          setHomeData(prev => ({ ...prev, image: result.url }));
        }
        toast.success("Profile image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Profile image upload error:", error);
      if (error instanceof Error && error.message.includes("Network")) {
        toast.error("No internet connection. Please check your network and try again.");
      } else if (error instanceof Error && error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerProfileFileSelect = () => {
    profileFileInputRef.current?.click();
  };

  // Document upload function
  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create Supabase client for browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the title and description from the current form
      const title =
        aboutData.certifications[index]?.title ||
        file.name.replace(/\.[^/.]+$/, "");
      const description =
        aboutData.certifications[index]?.description ||
        `Certificate in the ${file.name.replace(/\.[^/.]+$/, "")} area`;

      // Upload the certificate file to the documents/certificates/ folder
      // Include metadata with the title and description
      const { data, error } = await supabase.storage
        .from("Images") // Using the Images bucket
        .upload(`documents/certificates/${file.name}`, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting if file with same name exists
          contentType: file.type,
          // Store custom metadata with the file
          metaData: {
            title: title,
            description: description,
          },
        });

      if (error) {
        console.error("Error uploading certificate to Supabase:", error);
        toast.error("Failed to upload certificate");
        return;
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("Images")
        .getPublicUrl(`documents/certificates/${file.name}`);

      // Update the local state with the new file URL and metadata
      setAboutData((prev) => {
        const updatedCerts = [...prev.certifications];
        updatedCerts[index] = {
          ...updatedCerts[index],
          file: publicUrl, // Update with the public URL
          // Don't update the ID since we're not storing in DB anymore
        };
        return { ...prev, certifications: updatedCerts };
      });

      toast.success("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Certificate upload error:", error);
      toast.error("Failed to upload certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get the category for this document from the input field
      const category = documentsData[index]?.category || "documents";

      // Upload document organized by category
      const result = await uploadDocumentToSupabase(file, category);

      if (result.success && result.url) {
        // Update the specific document item with the new document URL
        const updatedDocuments = [...documentsData];
        updatedDocuments[index] = {
          ...updatedDocuments[index],
          file: result.url, // Store the public URL
          title:
            updatedDocuments[index].title || file.name.replace(/\.[^/.]+$/, ""), // Set title to filename if not already set
          // Don't include category field to prevent DB errors
        };
        setDocumentsData(updatedDocuments);
        toast.success("Document uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  // --- LIFE CYCLE HOOKS ---

  // Main effect for data fetching and authentication handling

  const fetchUsersData = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        if (response.status === 0) {
          // Network error (no connection)
          throw new Error("Network error: Unable to connect to the server");
        } else if (response.status >= 500) {
          // Server error
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
        }
        throw new Error("Failed to fetch users data");
      }

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users data:", error);
      if (error.message.includes("Network error")) {
        toast.error("No internet connection. Please check your network and try again.");
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error("Failed to load users data");
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading

    if (!session) {
      // If no session, redirect to sign in
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      // Always fetch categories
      fetchCategories();
    }
  }, [session, status, router]);

  // Effect for fetching data when active tab changes
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (activeTab === "home") {
        fetchHomeData();
      } else if (activeTab === "about") {
        fetchAboutData();
      } else if (activeTab === "gallery") {
        fetchGalleryData();
      } else if (activeTab === "skills") {
        fetchSkillsData();
      } else if (activeTab === "projects") {
        fetchProjectsData();
      } else if (activeTab === "documents") {
        fetchDocumentsData();
      } else if (activeTab === "users") {
        fetchUsersData();
      }
    }
  }, [activeTab, status, session]);

  // --- DATA CHANGE HANDLERS (CRUD helpers) ---

  // Home tab functions
  const handleHomeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHomeData((prev) => ({ ...prev, [name]: value }));
  };

  // About tab functions
  const handleAboutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
  };

  // Skills tab functions
  const handleSkillCategoryChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedCategories = [...skillsData.skillCategories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setSkillsData((prev) => ({ ...prev, skillCategories: updatedCategories }));
  };

  const handleSkillChange = (
    categoryIndex: number,
    skillIndex: number,
    field: string,
    value: any
  ) => {
    const updatedCategories = [...skillsData.skillCategories];
    updatedCategories[categoryIndex].skills[skillIndex] = {
      ...updatedCategories[categoryIndex].skills[skillIndex],
      [field]: value,
    };
    setSkillsData((prev) => ({ ...prev, skillCategories: updatedCategories }));
  };

  const handleAddSkill = (categoryIndex: number) => {
    const newSkill = {
      name: "New Skill",
      level: 50,
    };
    const updatedCategories = [...skillsData.skillCategories];
    updatedCategories[categoryIndex].skills.push(newSkill);
    setSkillsData((prev) => ({ ...prev, skillCategories: updatedCategories }));
  };

  const handleRemoveSkill = (categoryIndex: number, skillIndex: number) => {
    const updatedCategories = [...skillsData.skillCategories];
    updatedCategories[categoryIndex].skills = updatedCategories[
      categoryIndex
    ].skills.filter((_, i) => i !== skillIndex);
    setSkillsData((prev) => ({ ...prev, skillCategories: updatedCategories }));
  };

  // Main save handler that saves data based on the active tab
  const handleSave = async () => {
    try {
      setSaving(true);

      if (activeTab === "home") {
        // Save home data
        const response = await fetch("/api/admin/home", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(homeData),
        });

        if (!response.ok) {
          if (response.status === 0) {
            // Network error (no connection)
            throw new Error("Network error: Unable to connect to the server");
          } else if (response.status >= 500) {
            // Server error
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
          }
          throw new Error("Failed to save home data");
        }

        toast.success("Home data updated successfully!");
      } else if (activeTab === "about") {
        // Save about data
        const response = await fetch("/api/admin/about", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aboutData),
        });

        if (!response.ok) {
          if (response.status === 0) {
            throw new Error("Network error: Unable to connect to the server");
          } else if (response.status >= 500) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save about data");
        }

        toast.success("About page data updated successfully!");
      } else if (activeTab === "skills") {
        // Save skills data
        const response = await fetch("/api/admin/skills", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(skillsData),
        });

        if (!response.ok) {
          if (response.status === 0) {
            throw new Error("Network error: Unable to connect to the server");
          } else if (response.status >= 500) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save skills data");
        }

        toast.success("Skills data updated successfully!");
      } else if (activeTab === "projects") {
        // Save projects data
        const response = await fetch("/api/admin/projects", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectsData),
        });

        if (!response.ok) {
          if (response.status === 0) {
            throw new Error("Network error: Unable to connect to the server");
          } else if (response.status >= 500) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText || 'Internal server error'}`);
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save projects data");
        }

        toast.success("Projects data updated successfully!");
      } else if (activeTab === "gallery") {
        // For gallery items managed in Supabase storage, the save essentially just confirms the data has been updated in state
        // The actual gallery data comes from storage, so we just need to verify the state is saved correctly
        // In a more complex scenario, this might sync gallery metadata with the database

        // Simply confirm the data is up to date in state
        toast.success("Gallery data updated successfully!");
      } else if (activeTab === "documents") {
        // For documents managed in Supabase storage, the save essentially just confirms the data has been updated in state
        // The actual document data comes from storage, so we just need to verify the state is saved correctly
        // In a more complex scenario, this might sync document metadata with the database

        // Simply confirm the data is up to date in state
        toast.success("Documents data updated successfully!");
      } else if (activeTab === "users") {
        // Users tab save - call the specific user update handler
        await handleUserUpdate();
      } else {
        toast.error(`Saving is not implemented for the ${activeTab} tab`);
      }
    } catch (error) {
      console.error(`Error saving ${activeTab} data:`, error);
      if (error.message.includes("Network error")) {
        toast.error("No internet connection. Please check your network and try again.");
      } else if (error.message.includes("Server error")) {
        toast.error(`Server error occurred: ${error.message}`);
      } else {
        toast.error(`Failed to save ${activeTab} data`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkillCategory = () => {
    const newCategory = {
      title: "New Category",
      skills: [{ name: "New Skill", level: 50 }],
    };
    setSkillsData((prev) => ({
      ...prev,
      skillCategories: [...prev.skillCategories, newCategory],
    }));
  };

  const handleRemoveSkillCategory = (index: number) => {
    setSkillsData((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.filter((_, i) => i !== index),
    }));
  };

  const handleAdditionalSkillsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setSkillsData((prev) => ({ ...prev, additionalSkills: skills }));
  };

  // Projects tab functions
  const handleProjectChange = (index: number, field: string, value: any) => {
    const updatedProjects = [...projectsData];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjectsData(updatedProjects);
  };

  const handleAddProject = () => {
    // Calculate a unique ID that doesn't conflict with existing IDs
    const maxExistingId =
      projectsData.length > 0 ? Math.max(...projectsData.map((p) => p.id)) : 0;
    const newId = maxExistingId + 1;

    const newProject = {
      id: newId,
      title: "New Project",
      description: "Description of the new project",
      link: "https://example.com",
      stack: [], // Initialize as an empty array
      category: "Web Development",
    };
    // Add new project to the beginning of the array (prepend instead of append)
    setProjectsData([newProject, ...projectsData]);
  };

  const handleRemoveProject = async (index: number) => {
    const projectToRemove = projectsData[index];
    if (
      confirm(
        `Are you sure you want to delete the project "${projectToRemove.title}"?`
      )
    ) {
      try {
        const response = await fetch("/api/admin/projects", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: projectToRemove.id }),
        });

        if (!response.ok) {
          if (response.status === 0) {
            // Network error (no connection)
            throw new Error("Network error: Unable to connect to the server");
          } else if (response.status >= 500) {
            // Server error
            const errorText = await response.text();
            throw new Error(
              `Server error: ${response.status} - ${
                errorText || "Internal server error"
              }`
            );
          }
          throw new Error("Failed to delete project");
        }

        toast.success(projectToRemove.title + " deleted successfully!");
        setProjectsData((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting project:", error);
        if (error instanceof Error && error.message.includes("Network error")) {
          toast.error(
            "No internet connection. Please check your network and try again."
          );
        } else if (
          error instanceof Error &&
          error.message.includes("Server error")
        ) {
          toast.error(`Server error occurred: ${error.message}`);
        } else {
          toast.error("Failed to delete project");
        }
      }
    }
  };

  // --- RENDERING ---

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render the page
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            className="text-4xl font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Content <span className="text-accent-cyan">Management</span> Dashboard
          </motion.div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="btn btn-secondary px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-700">
          {[
            "home",
            "about",
            "skills",
            "projects",
            "gallery",
            "documents",
            "images",
            "users"
          ].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                activeTab === tab
                  ? "bg-slate-700 text-accent-cyan border-b-2 border-accent-cyan"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              onClick={() => {
                setActiveTab(tab);
                // Save the active tab to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('adminActiveTab', tab);
                }
              }}
            >
              {tab === "images"
                ? "Media & Files"
                : tab === "users"
                ? "User Management"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan">
                Home Page Content
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={homeData.name}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={homeData.title}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={homeData.email}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={homeData.phone}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={homeData.location}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2">
                    Career Focus
                  </label>
                  <input
                    type="text"
                    name="careerFocus"
                    value={homeData.careerFocus}
                    onChange={handleHomeChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2">
                    Profile Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      name="image"
                      value={homeData.image}
                      onChange={handleHomeChange}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      placeholder="Or enter image URL"
                    />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      disabled={uploading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                  {homeData.image && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={
                          homeData.image.startsWith("http")
                            ? homeData.image
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Images/${homeData.image}`
                        }
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-2 border-accent-cyan"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2">About</label>
                  <textarea
                    name="about"
                    value={homeData.about}
                    onChange={handleHomeChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={homeData.skills.join(", ")}
                    onChange={(e) =>
                      setHomeData((prev) => ({
                        ...prev,
                        skills: e.target.value
                          .split(",")
                          .map((skill) => skill.trim()),
                      }))
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan">
                About Page Content
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={aboutData.name}
                  onChange={handleAboutChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={aboutData.title}
                  onChange={handleAboutChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2">Biography</label>
                <textarea
                  name="about"
                  value={aboutData.about}
                  onChange={handleAboutChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2">
                  Profile Image
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    name="image"
                    value={aboutData.image}
                    onChange={handleAboutChange}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    placeholder="Or enter image URL"
                  />
                  <button
                    type="button"
                    onClick={triggerAboutFileSelect}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
                {aboutData.image && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={
                        aboutData.image.startsWith("http")
                          ? aboutData.image
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Images/${aboutData.image}`
                      }
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-accent-cyan"
                    />
                  </div>
                )}
                <input
                  type="file"
                  ref={aboutFileInputRef}
                  onChange={handleAboutImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={aboutData.location}
                  onChange={handleAboutChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
            </div>

            {/* Education */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-accent-cyan">
                Education
              </h3>
              {aboutData.education.map((edu, index) => (
                <div key={edu.id} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold">
                      Education #{index + 1}
                    </h4>
                    <button
                      onClick={() => {
                        const updated = [...aboutData.education];
                        updated.splice(index, 1);
                        setAboutData((prev) => ({
                          ...prev,
                          education: updated,
                        }));
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2">
                        School
                      </label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...aboutData.education];
                          updated[index] = {
                            ...updated[index],
                            school: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            education: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...aboutData.education];
                          updated[index] = {
                            ...updated[index],
                            degree: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            education: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-2">
                        Period
                      </label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...aboutData.education];
                          updated[index] = {
                            ...updated[index],
                            period: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            education: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => {
                          const updated = [...aboutData.education];
                          updated[index] = {
                            ...updated[index],
                            description: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            education: updated,
                          }));
                        }}
                        rows={2}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const newEdu = {
                    id:
                      Math.max(...aboutData.education.map((e) => e.id), 0) + 1,
                    school: "New School",
                    degree: "New Degree",
                    period: "20XX - 20XX",
                    description: "Description of education",
                  };
                  setAboutData((prev) => ({
                    ...prev,
                    education: [...prev.education, newEdu],
                  }));
                }}
                className="btn btn-primary px-4 py-2 rounded-lg mt-2"
              >
                Add Education
              </button>
            </div>

            {/* Experience */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-accent-cyan">
                Experience
              </h3>
              {aboutData.experiences.map((exp, index) => (
                <div key={exp.id} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold">
                      Experience #{index + 1}
                    </h4>
                    <button
                      onClick={() => {
                        const updated = [...aboutData.experiences];
                        updated.splice(index, 1);
                        setAboutData((prev) => ({
                          ...prev,
                          experiences: updated,
                        }));
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...aboutData.experiences];
                          updated[index] = {
                            ...updated[index],
                            title: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            experiences: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...aboutData.experiences];
                          updated[index] = {
                            ...updated[index],
                            company: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            experiences: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-2">
                        Period
                      </label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...aboutData.experiences];
                          updated[index] = {
                            ...updated[index],
                            period: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            experiences: updated,
                          }));
                        }}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...aboutData.experiences];
                          updated[index] = {
                            ...updated[index],
                            description: e.target.value,
                          };
                          setAboutData((prev) => ({
                            ...prev,
                            experiences: updated,
                          }));
                        }}
                        rows={2}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const newExp = {
                    id:
                      Math.max(...aboutData.experiences.map((e) => e.id), 0) +
                      1,
                    title: "New Position",
                    company: "New Company",
                    period: "20XX - 20XX",
                    description: "Description of experience",
                  };
                  setAboutData((prev) => ({
                    ...prev,
                    experiences: [...prev.experiences, newExp],
                  }));
                }}
                className="btn btn-primary px-4 py-2 rounded-lg mt-2"
              >
                Add Experience
              </button>
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap gap-4 mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan flex-1">
                Skills Management
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSkillCategory}
                  className="btn btn-primary px-4 py-2 rounded-lg"
                >
                  Add Skill Category
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="mb-6"></div>

            <div className="space-y-6">
              {skillsData.skillCategories.map((category, catIndex) => (
                <div key={catIndex} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Skill Category #{catIndex + 1}
                    </h3>
                    <button
                      onClick={() => handleRemoveSkillCategory(catIndex)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove Category
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-slate-300 mb-2">
                      Category Title
                    </label>
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) =>
                        handleSkillCategoryChange(
                          catIndex,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                    />
                  </div>

                  <div className="space-y-3">
                    {category.skills.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              handleSkillChange(
                                catIndex,
                                skillIndex,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                            placeholder="Skill name"
                          />
                        </div>

                        <div className="col-span-5">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.level}
                            onChange={(e) =>
                              handleSkillChange(
                                catIndex,
                                skillIndex,
                                "level",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <span className="text-slate-300">{skill.level}%</span>
                        </div>

                        <div className="col-span-12 mt-2 flex justify-end">
                          <button
                            onClick={() =>
                              handleRemoveSkill(catIndex, skillIndex)
                            }
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Remove Skill
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddSkill(catIndex)}
                    className="btn btn-secondary px-3 py-1 rounded mt-2 text-sm"
                  >
                    Add Skill
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap gap-4 mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan flex-1">
                Projects Management
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleAddProject}
                  className="btn btn-primary px-4 py-2 rounded-lg"
                >
                  Add Project
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {projectsData.map((project, index) => (
                <div key={project.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Project #{project.id}
                    </h3>
                    <button
                      onClick={() => handleRemoveProject(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) =>
                          handleProjectChange(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) =>
                          handleProjectChange(index, "category", e.target.value)
                        }
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) =>
                          handleProjectChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-2">
                        Project Link
                      </label>
                      <input
                        type="text"
                        value={project.link}
                        onChange={(e) =>
                          handleProjectChange(index, "link", e.target.value)
                        }
                        className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-slate-300">Tech Stack</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProjects = [...projectsData];
                            if (!Array.isArray(updatedProjects[index].stack)) {
                              updatedProjects[index].stack = [];
                            }
                            updatedProjects[index].stack.push("New Tech"); // Add a new technology
                            setProjectsData(updatedProjects);
                          }}
                          className="text-xs bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 px-2 py-1 rounded transition-colors"
                        >
                          Add Tech
                        </button>
                      </div>

                      <div className="space-y-2">
                        {Array.isArray(project.stack) && project.stack.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tech}
                              onChange={(e) => {
                                const updatedProjects = [...projectsData];
                                updatedProjects[index].stack[techIndex] = e.target.value;
                                setProjectsData(updatedProjects);
                              }}
                              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan text-sm"
                              placeholder="Technology name"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedProjects = [...projectsData];
                                updatedProjects[index].stack = updatedProjects[index].stack.filter((_, i) => i !== techIndex);
                                setProjectsData(updatedProjects);
                              }}
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {!Array.isArray(project.stack) || project.stack.length === 0 ? (
                          <p className="text-slate-500 text-sm italic">No technologies added yet</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan">
                Gallery Management
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Refresh View"}
              </button>
            </div>

            <p className="text-slate-400 mb-6">
              View and manage all gallery images stored in Supabase. You can organize images into folders by category.
            </p>

            <div className="border-t border-slate-700 pt-6">
              <GalleryManager />
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan">
                Document Management
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Refresh View"}
              </button>
            </div>

            <p className="text-slate-400 mb-6">
              View and manage all document files stored in Supabase. You can organize documents into folders and manage them directly.
            </p>

            <div className="border-t border-slate-700 pt-6">
              <DocumentManager />
            </div>
          </motion.div>
        )}

        {/* Media & Files Tab */}
        {activeTab === "images" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-cyan">
              Media & Files Management
            </h2>
            <p className="text-slate-400 mb-6">
              View and manage all media files stored in Supabase. You can delete
              individual files from storage.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-accent-cyan">
                  Profile Images
                </h3>
                <div className="border-t border-slate-700 pt-4">
                  <ImageManager />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-accent-cyan">
                  Gallery
                </h3>
                <div className="border-t border-slate-700 pt-4">
                  <GalleryManager />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-accent-cyan">
                  Documents
                </h3>
                <div className="border-t border-slate-700 pt-4">
                  <DocumentManager />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent-cyan">
                User Management
              </h2>
              <button
                onClick={handleUserUpdate}
                disabled={saving}
                className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Update User"}
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List */}
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-semibold mb-4 text-accent-cyan">
                    Users List
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? "bg-accent-cyan/20 border border-accent-cyan"
                            : "bg-slate-700 hover:bg-slate-600"
                        }`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="font-medium">{user.name || 'No Name'}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                        <div className="text-xs text-slate-500">Role: {user.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Details */}
                <div className="lg:col-span-2">
                  {selectedUser ? (
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">
                        Edit User: {selectedUser.name || selectedUser.email}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-slate-300 mb-2">Email</label>
                          <input
                            type="email"
                            value={selectedUser.email}
                            onChange={(e) =>
                              setSelectedUser({
                                ...selectedUser,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-2">Password</label>
                          <input
                            type="password"
                            value={selectedUser.password}
                            onChange={(e) =>
                              setSelectedUser({
                                ...selectedUser,
                                password: e.target.value,
                              })
                            }
                            placeholder="Enter new password (leave blank to keep current)"
                            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-2">Role</label>
                          <select
                            value={selectedUser.role}
                            onChange={(e) =>
                              setSelectedUser({
                                ...selectedUser,
                                role: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700 rounded-lg p-4 text-center">
                      <p className="text-slate-400">
                        Select a user from the list to edit their details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}