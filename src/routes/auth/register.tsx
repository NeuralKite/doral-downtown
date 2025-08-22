import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building,
  Phone,
  Globe,
  MapPin,
  Users,
  Shield,
} from "lucide-react";
import { UserRole } from "../../types";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessWebsite?: string;
}

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useSupabaseAuth();
  const [selectedRole, setSelectedRole] = useState<"user" | "business">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessWebsite: "",
  });

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError("Email, password, and name are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (selectedRole === "business") {
      if (!formData.businessName) {
        setError("Business name is required for business accounts");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: selectedRole,
        phone: formData.phone || undefined,
        businessName:
          selectedRole === "business" ? formData.businessName : undefined,
        businessDescription:
          selectedRole === "business"
            ? formData.businessDescription
            : undefined,
        businessAddress:
          selectedRole === "business" ? formData.businessAddress : undefined,
        businessWebsite:
          selectedRole === "business" ? formData.businessWebsite : undefined,
      };

      console.log("Submitting registration for:", {
        email: registerData.email,
        role: registerData.role,
        hasBusinessData:
          selectedRole === "business" && !!registerData.businessName,
      });

      const result = await register(registerData);

      if (result) {
        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );

        // Navigate to verification page immediately
        setTimeout(() => {
          navigate({
            to: "/auth/verify-email",
            search: { email: formData.email, role: selectedRole },
          });
        }, 2000); // Give more time to show the success message
      } else {
        setError(
          "Registration failed. Please check if the email is already in use or try again."
        );
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleSwitchToLogin = () => {
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center mb-6 space-x-2 transition-colors text-brand-secondary hover:text-brand-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <h2 className="text-3xl font-bold text-brand-primary">
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join the Doral Downtown community
          </p>
        </div>

        {/* Registration Form */}
        <div className="p-8 bg-white shadow-md rounded-2xl">
          {/* Account Type Selection */}
          <div className="mb-8">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              What type of account would you like?
            </h3>

            <div className="space-y-4">
              {/* Personal Account Option */}
              <div
                onClick={() => setSelectedRole("user")}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedRole === "user"
                    ? "border-brand-primary bg-brand-primary/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedRole === "user"
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-semibold mb-2 ${
                        selectedRole === "user"
                          ? "text-brand-primary"
                          : "text-gray-900"
                      }`}
                    >
                      Personal Account
                    </h4>
                    <p className="text-sm text-gray-600">
                      Perfect for residents and visitors who want to explore and
                      discover amazing places in Doral. Save favorites, write
                      reviews, and stay updated with local events.
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === "user"
                        ? "border-brand-primary bg-brand-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRole === "user" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Account Option */}
              <div
                onClick={() => setSelectedRole("business")}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedRole === "business"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedRole === "business"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-lg font-semibold mb-2 ${
                        selectedRole === "business"
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      Business Account
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ideal for business owners who want to showcase their
                      services, manage listings, connect with customers, and
                      promote events in the Doral community.
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === "business"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRole === "business" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center p-4 mb-6 space-x-3 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 mb-6 space-x-3 border border-green-200 rounded-lg bg-green-50">
              <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h4 className="flex items-center mb-6 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      placeholder="(305) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h4 className="flex items-center mb-6 text-lg font-semibold text-gray-900">
                <Mail className="w-5 h-5 mr-2 text-gray-600" />
                Account Information
              </h4>
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full py-3 pl-10 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Create password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information (only for business accounts) */}
            {selectedRole === "business" && (
              <div>
                <h4 className="flex items-center mb-6 text-lg font-semibold text-gray-900">
                  <Building className="w-5 h-5 mr-2 text-gray-600" />
                  Business Information
                </h4>
                <div className="space-y-6">
                  {/* Business Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                        className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Description */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Business Description
                    </label>
                    <textarea
                      value={formData.businessDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      placeholder="Describe your business..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Business Address */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Business Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="text"
                          value={formData.businessAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessAddress: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          placeholder="Business address"
                        />
                      </div>
                    </div>

                    {/* Business Website */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="url"
                          value={formData.businessWebsite}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessWebsite: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          placeholder="https://yourbusiness.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === "business"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    : "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90"
                }`}
              >
                {isLoading
                  ? "Creating Account..."
                  : `Create ${
                      selectedRole === "business" ? "Business" : "Personal"
                    } Account`}
              </button>
            </div>
          </form>
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={handleSwitchToLogin}
              className="font-medium text-brand-primary hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
