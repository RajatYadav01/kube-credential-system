import axios from "axios";
import { useState } from "react";
import { getConfig } from "../utilities/configService";

interface VerificationResult {
  verified?: boolean;
  credentialId?: string;
  type?: string;
  issuer?: string;
  claims?: Record<string, any>;
  subjectId?: string;
  issuedAt?: string;
  workerId?: string;
  verifiedBy?: string;
  message?: string;
  error?: string;
}

export const VerificationPage = () => {
  const [subjectId, setSubjectId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateInput = (): boolean => {
    if (!subjectId.trim()) {
      setError("Subject ID is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleVerify = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setResult(null);

    try {
      const config = await getConfig();
      const apiUrl =
        config.BACKEND_VERIFICATION_API_URL ||
        import.meta.env.VITE_VERIFICATION_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/verification/verify`,
        { subjectId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setResult(response.data);

      if (response.data.verified) {
        setSubjectId("");
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

  const handleInputChange = (value: string) => {
    setSubjectId(value);
    if (error) setError("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2">
          Verify Credential
        </h2>
        <p className="text-gray-600">
          Check the validity of issued credentials
        </p>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="subject-id-verification"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject ID *
            </label>
            <input
              id="subject-id-verification"
              type="text"
              value={subjectId}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`p-1 border rounded-md border-gray-400 w-full text-black ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Enter the credential ID to verify"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="px-[1.2em] py-[0.6em] w-full min-w-[15rem] md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credential...</span>
                </div>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        /* <div
          className={`card ${
            result.error
              ? "border-red-200 bg-red-50"
              : result.verified
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            {result.verified ? (
              <>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Credential Verified
                </h3>
              </>
            ) : result.error ? (
              <>
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✗</span>
                </div>
                <h3 className="text-lg font-semibold text-red-800">
                  Verification Failed
                </h3>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Credential Not Found
                </h3>
              </>
            )}
          </div>

          <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-lg border">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div> */
        <div
          className={`relative p-4 rounded-md ${
            result.error
              ? "border border-red-300 bg-red-50"
              : result.verified
              ? "border border-green-300 bg-green-50"
              : "border border-yellow-300 bg-yellow-50"
          }`}
        >
          <button
            onClick={() => setResult(null)}
            aria-label="Close result message"
            className="absolute top-3 right-3 w-8 h-8 text-white hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>

          <div className="flex items-center space-x-3 mb-3">
            {result.verified ? (
              <>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Credential Verified
                </h3>
              </>
            ) : result.error ? (
              <>
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">X</span>
                </div>
                <h3 className="text-lg font-semibold text-red-800">
                  Verification Failed
                </h3>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Credential Not Found
                </h3>
              </>
            )}
          </div>

          <p className="mb-2 text-sm text-gray-700">
            {result.error
              ? result.error
              : result.verified
              ? "The credential is valid and verified" +
                " by worker: " +
                result.verifiedBy
              : "No matching credential found with the given ID" +
                " by worker: " +
                result.verifiedBy}
          </p>

          {result.verified && result.credentialId && (
            <p className="text-sm font-mono text-gray-800">
              Credential ID:{" "}
              <span className="font-bold">{result.credentialId}</span>
            </p>
          )}
          {result.verified && result.subjectId && (
            <p className="text-sm font-mono text-gray-800">
              Subject ID: <span className="font-bold">{result.subjectId}</span>
            </p>
          )}
          {result.verified && result.issuedAt && (
            <p className="text-sm font-mono text-gray-800">
              Issued At: <span className="font-bold">{result.issuedAt}</span>
            </p>
          )}
          {result.verified && result.workerId && (
            <p className="text-sm font-mono text-gray-800">
              Worker ID: <span className="font-bold">{result.workerId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
