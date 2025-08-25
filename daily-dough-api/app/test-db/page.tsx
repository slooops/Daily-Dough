import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Test form to interact with database
export default function DatabaseTestPage() {
  async function addTestData(formData: FormData) {
    "use server";

    try {
      const userId = formData.get("userId") as string;
      const testToken = formData.get("testToken") as string;

      if (!userId || !testToken) {
        throw new Error("Both fields are required");
      }

      // Insert test data
      await sql`
        INSERT INTO user_items (user_id, access_token_enc, institution_id)
        VALUES (${userId}, ${testToken}, 'test-institution')
        ON CONFLICT (user_id) 
        DO UPDATE SET access_token_enc = excluded.access_token_enc
      `;

      console.log("✅ Test data inserted successfully");
    } catch (error) {
      console.error("❌ Error inserting test data:", error);
    }
  }

  async function viewAllData() {
    "use server";

    try {
      const result =
        await sql`SELECT * FROM user_items ORDER BY created_at DESC`;
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      return [];
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Dough - Database Test</h1>

      <div className="space-y-8">
        {/* Add Test Data Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Test Data</h2>
          <form action={addTestData} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium mb-1"
              >
                User ID
              </label>
              <input
                type="text"
                name="userId"
                id="userId"
                placeholder="e.g., test-user-123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="testToken"
                className="block text-sm font-medium mb-1"
              >
                Test Token (encrypted in real app)
              </label>
              <input
                type="text"
                name="testToken"
                id="testToken"
                placeholder="e.g., fake-encrypted-token-abc123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Test Data
            </button>
          </form>
        </div>

        {/* View Data Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Current Database Contents
          </h2>
          <form
            action={async () => {
              "use server";
              const data = await viewAllData();
              console.log("Current data:", data);
            }}
          >
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Refresh & View Data (Check Console)
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              📝 <strong>Note:</strong> This is a development test page.
            </p>
            <p>
              🔧 Data will appear in your browser's developer console when you
              click "Refresh & View Data".
            </p>
            <p>
              🚀 In production, you'll interact with this data through your
              React Native app via the API endpoints.
            </p>
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Your API Endpoints</h2>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">
                GET /api/health
              </code>
              <span className="ml-2 text-gray-600">- Health check</span>
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">
                POST /api/plaid/link-token/create
              </code>
              <span className="ml-2 text-gray-600">
                - Create Plaid Link token
              </span>
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">
                POST /api/plaid/item/public_token/exchange
              </code>
              <span className="ml-2 text-gray-600">
                - Exchange Plaid tokens
              </span>
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">
                GET /api/plaid/transactions
              </code>
              <span className="ml-2 text-gray-600">- Fetch transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
