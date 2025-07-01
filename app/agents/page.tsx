export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Agents</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">About AI Agents</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-xl mr-2">🤝</span>
            <span>
              This showcases LangChain.js agents with memory and tool access.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">🛠️</span>
            <span>
              The agent has access to search engines and calculators.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">🦜</span>
            <span>
              By default, the agent acts as a talking parrot, but you can customize the prompt.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-xl mr-2">👇</span>
            <span>
              Try asking: <code className="bg-gray-100 px-2 py-1 rounded">What is the weather in Honolulu?</code>
            </span>
          </li>
        </ul>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Chat Interface</h3>
        <p className="text-gray-600">
          The full chat interface with agent capabilities will be available once the build issues are resolved.
          This would normally include a conversational AI that can use tools to answer complex questions.
        </p>
      </div>
    </div>
  );
}
