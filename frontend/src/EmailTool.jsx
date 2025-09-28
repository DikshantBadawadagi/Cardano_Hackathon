import { useState } from 'react'
import { createOrUpdateNode } from './utils/api'

export default function EmailTool({ onWorkflowRefresh }) {
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const exactEmailNode = {
    "name": "apiRequest_1758818520523",
    "type": "tool",
    "metadata": {
      "position": {
        "x": -409.59875258484476,
        "y": 500.92715101065335
      }
    },
    "tool": {
      "url": "https://lasting-older-architects-holidays.trycloudflare.com/api/send-email",
      "body": {
        "type": "object",
        "required": [
          "receiverEmail",
          "message",
          "subject"
        ],
        "properties": {
          "message": {
            "type": "string",
            "default": "{{message}}",
            "description": "users message"
          },
          "subject": {
            "type": "string",
            "default": "Sent by my business",
            "description": "emails subject"
          },
          "receiverEmail": {
            "type": "boolean",
            "default": "{{email}}",
            "description": "receivers email address"
          }
        }
      },
      "name": "email",
      "type": "apiRequest",
      "method": "POST",
      "function": {
        "name": "api_request_tool",
        "parameters": {
          "type": "object",
          "required": [],
          "properties": {}
        },
        "description": "API request tool"
      },
      "messages": [
        {
          "type": "request-start",
          "blocking": false
        }
      ],
      "variableExtractionPlan": {
        "schema": {
          "type": "object",
          "required": [
            "success",
            "recipient",
            "message"
          ],
          "properties": {
            "message": {
              "type": "string",
              "description": ""
            },
            "success": {
              "type": "boolean",
              "description": ""
            },
            "recipient": {
              "type": "string",
              "description": ""
            }
          }
        },
        "aliases": []
      }
    }
  }

  const handlePostEmailNode = async () => {
    setIsPosting(true)
    setError('')
    setResult(null)
    try {
      const res = await createOrUpdateNode(exactEmailNode)
      setResult(res)
      if (typeof onWorkflowRefresh === 'function') {
        await onWorkflowRefresh()
      }
    } catch (err) {
      setError(err.message || 'Failed to create email node')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="h-full w-full bg-gray-900 text-white p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Email Tool</h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-300 mb-4">Click to add the Email tool node to your workflow.</p>
          <button
            onClick={handlePostEmailNode}
            disabled={isPosting}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 transition-colors"
          >
            {isPosting ? 'Creating...' : 'Create Email Node'}
          </button>

          {error && (
            <div className="mt-4 p-3 rounded-md border border-red-700 bg-red-900/30 text-red-200">{error}</div>
          )}
          {result && (
            <pre className="mt-4 text-sm bg-black/30 p-3 rounded border border-gray-700 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  )
}


