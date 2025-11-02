import axios from "axios";
import { useState } from "react";
import { getConfig } from "../utilities/configService";

interface Credential {
  type: string;
  issuer: string;
  subjectId: string;
  claims: Record<string, any>;
}

interface IssuanceResult {
  message?: string;
  credentialId?: string;
  subjectId?: string;
  issuedAt?: string;
  workerId?: string;
  error?: string;
}

export const IssuancePage = () => {
  const [credential, setCredential] = useState<Credential>({
    type: "Identity Credential",
    issuer: "Kube Credential System",
    subjectId: "",
    claims: {
      name: "",
      email: "",
      role: "",
    },
  });
  const [result, setResult] = useState<IssuanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credential.type.trim()) {
      newErrors.type = "Type is required";
    }
    if (!credential.issuer.trim()) {
      newErrors.issuer = "Issuer is required";
    }
    if (!credential.subjectId.trim()) {
      newErrors.subjectId = "Subject ID is required";
    }
    if (!credential.claims.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIssue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setResult(null);

    try {
      const config = await getConfig();
      const apiUrl =
        config.BACKEND_ISSUANCE_API_URL ||
        import.meta.env.VITE_ISSUANCE_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/issuance/issue`,
        credential,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setResult(response.data);

      if (response.status === 201) {
        setCredential({
          type: "Identity Credential",
          issuer: "Kube Credential System",
          subjectId: "",
          claims: {
            name: "",
            email: "",
            role: "",
          },
        });
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status) {
          setResult(
            error.response?.data || {
              error: error.response.data.error || "Unexpected error occurred",
            }
          );
        } else {
          setResult(
            error.response?.data.error || {
              error: "Network error: Service unavailable",
            }
          );
        }
      } else {
        setResult({ error: "An unknown error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateClaim = (key: string, value: string) => {
    setCredential((prev) => ({
      ...prev,
      claims: {
        ...prev.claims,
        [key]: value,
      },
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFieldChange = (field: keyof Credential, value: string) => {
    setCredential((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2">
          Issue Credential
        </h2>
        <p className="text-gray-600">
          Create and issue new digital credentials
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Credential Type *
              </label>
              <input
                id="type"
                type="text"
                value={credential.type}
                onChange={(e) => handleFieldChange("type", e.target.value)}
                className={`p-1 border rounded-md border-gray-400 w-full text-black ${
                  errors.type
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Enter credential type"
              />
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="issuer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Issuer *
              </label>
              <input
                id="issuer"
                type="text"
                value={credential.issuer}
                onChange={(e) => handleFieldChange("issuer", e.target.value)}
                className={`p-1 border rounded-md border-gray-400 w-full text-black ${
                  errors.issuer
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Enter issuer name"
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-600">{errors.issuer}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="subject-id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject ID *
              </label>
              <input
                id="subject-id"
                type="text"
                value={credential.subjectId}
                onChange={(e) => handleFieldChange("subjectId", e.target.value)}
                className={`p-1 border rounded-md border-gray-400 w-full text-black ${
                  errors.subjectId
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Enter unique subject identifier"
              />
              {errors.subjectId && (
                <p className="mt-1 text-sm text-red-600">{errors.subjectId}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Claims</h3>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={credential.claims.name}
                onChange={(e) => updateClaim("name", e.target.value)}
                className={`p-1 border rounded-md border-gray-400 w-full text-black ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={credential.claims.email}
                onChange={(e) => updateClaim("email", e.target.value)}
                className="p-1 border rounded-md border-gray-400 w-full text-black"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <input
                id="role"
                type="text"
                value={credential.claims.role}
                onChange={(e) => updateClaim("role", e.target.value)}
                className="p-1 border rounded-md border-gray-400 w-full text-black"
                placeholder="Enter role"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleIssue}
            disabled={loading}
            className="px-[1.2em] py-[0.6em] w-full min-w-[15rem] md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Issuing Credential...</span>
              </div>
            ) : (
              "Issue"
            )}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`relative p-4 rounded-md ${
            result.error || result.message?.includes("already issued")
              ? "border border-red-300 bg-red-50"
              : "border border-green-300 bg-green-50"
          }`}
        >
          <button
            onClick={() => setResult(null)}
            aria-label="Close result message"
            className="absolute top-3 right-3 w-8 h-8 text-white hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
          <h3
            className={`text-lg font-semibold mb-2 ${
              result.error || result.message?.includes("already issued")
                ? "text-red-800"
                : "text-green-800"
            }`}
          >
            {result.error
              ? "Error"
              : result.message?.includes("already issued")
              ? "Duplicate Credential"
              : "Success"}
          </h3>
          <p className="mb-2 text-sm text-gray-700">
            {result.error
              ? result.error
              : result.message?.includes("already issued")
              ? "This credential has already been issued" +
                " by worker: " +
                result.workerId
              : (result.message || "Credential issued successfully") +
                " by worker: " +
                result.workerId}
          </p>

          {result.credentialId && !result.error && (
            <p className="text-sm font-mono text-gray-800">
              Credential ID:{" "}
              <span className="font-bold">{result.credentialId}</span>
            </p>
          )}
          {result.issuedAt && !result.error && (
            <p className="text-sm font-mono text-gray-800">
              Issued At: <span className="font-bold">{result.issuedAt}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
