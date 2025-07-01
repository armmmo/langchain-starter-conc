export default function StructuredOutputPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Structured Output</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">About Structured Output</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-xl mr-2">📊</span>
            <span>
              Generate structured data like JSON objects from natural language inputs.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">🎯</span>
            <span>
              Perfect for extracting specific information in a consistent format.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">🔧</span>
            <span>
              Uses LangChain.js output parsers to ensure reliable data extraction.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">💡</span>
            <span>
              Try asking for information to be formatted as JSON, lists, or tables.
            </span>
          </li>
        </ul>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Structured Output Interface</h3>
        <p className="text-gray-600">
          The full structured output interface will be available once the build issues are resolved.
          This would normally include examples of parsing natural language into structured data formats
          like JSON, CSV, or custom schemas.
        </p>
      </div>
    </div>
  );
}
