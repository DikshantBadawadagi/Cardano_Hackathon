import { useState } from 'react'
import { createOrUpdateNode } from './utils/api'

const UPLOAD_URL = '/api/projects/1/resources/add/'

// Hardcode cookie value here; user will replace it.
const Cookie = 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyNzA0OTQzMTM1LCJpYXQiOjE3NTg4NjMxMzUsImp0aSI6ImYzOTQ2ZjEzZDUxMDQ2Y2E4ODU0MDU4Nzc1MmRlMjliIiwidXNlcl9pZCI6MX0.bZqQ0teOf5z_LdK6LiH0NIFLiEkvfM5IU4zS0nc3xa0; refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MjcwNDk0MzEzNSwiaWF0IjoxNzU4ODYzMTM1LCJqdGkiOiJlMGY4ZGVkMWNhODM0ZGM4YThkYTkzODBkNjgwZmM2NSIsInVzZXJfaWQiOjF9.MEWSlDrYuKjfJ0JJqyGk2yUGdlbyWKazWZn5KdrXk3k'

export default function UploadPDFs({ onWorkflowRefresh }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [nodePosting, setNodePosting] = useState(false)
  const [nodeResult, setNodeResult] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
    setResult(null)
    setError('')
  }

  // const handleUpload = async () => {
  //   if (!selectedFile) return
  //   setIsUploading(true)
  //   setError('')
  //   setResult(null)
  //   try {
  //     const formData = new FormData()
  //     formData.append('pdf_files', selectedFile)

  //     const response = await fetch(UPLOAD_URL, {
  //       method: 'POST',
  //       body: formData,
  //       credentials: 'include', 
  //     })

  //     if (!response.ok) {
  //       const text = await response.text()
  //       throw new Error(text || `Upload failed with status ${response.status}`)
  //     }

  //     const data = await response.json()
  //     setResult(data)
  //   } catch (err) {
  //     setError(err.message || 'Upload failed')
  //   } finally {
  //     setIsUploading(false)
  //   }
  // }

  const handleUpload = async () => {
  if (!selectedFile) return
  setIsUploading(true)
  setError('')
  setResult(null)

  try {
    // Commenting out actual fetch call
    /*
    const formData = new FormData()
    formData.append('pdf_files', selectedFile)

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    setResult(data)
    */

    // Hardcoded response data
    const data = {
      message: "Successfully uploaded 1 PDF(s). Processing started in background.",
      resources: [
        {
          id: 2,
          user: 1,
          project: 1,
          pdf_file: "/media/resources/pdfs/Billboard_Advertising_in_Mumbai_UTf2snb.pdf",
          original_filename: "Billboard Advertising in Mumbai.pdf",
          created_at: "2025-09-26T07:27:08.130271Z",
          status: "pending"
        }
      ]
    }

    setResult(data)

  } catch (err) {
    setError(err.message || 'Upload failed')
  } finally {
    setIsUploading(false)
  }
}

  const exactNodeBody = {
    "name": "pdfRag",
    "type": "tool",
    "metadata": {
      "position": {
        "x": -470.6012321201803,
        "y": 1009.4312610542651
      }
    },
    "tool": {
      "type": "apiRequest",
      "function": {
        "name": "api_request_tool",
        "description": "API request tool",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": []
        }
      },
      "server": null,
      "messages": [
        {
          "type": "request-start",
          "blocking": false
        }
      ],
      "name": "ragm",
      "url": "https://amazing-donations-harry-shirt.trycloudflare.com/api/projects/1/chat/",
      "method": "POST",
      "headers": {
        "type": "object",
        "properties": {
          "Cookie": {
            "type": "string",
            "value": Cookie 
          },
          "Connection": {
            "type": "string",
            "value": "keep-alive"
          }
        }
      },
      "body": {
        "type": "object",
        "required": [
          "stream",
          "message",
          "resource_ids"
        ],
        "properties": {
          "stream": {
            "type": "boolean",
            "default": "false",
            "description": ""
          },
          "message": {
            "type": "string",
            "default": "{{query}}",
            "description": "users query"
          },
          "resource_ids": {
            "type": "array",
            "default": "",
            "description": "the array contains 3 elements the numbers 1,2,3, it should be like [1,2,3] thats it",
            "items": {
              "type": "number"
            }
          }
        }
      },
      "variableExtractionPlan": {
        "schema": {
          "type": "object",
          "required": [
            "conversation"
          ],
          "properties": {
            "conversation": {
              "type": "object",
              "required": [
                "assistant_content"
              ],
              "description": "",
              "properties": {
                "assistant_content": {
                  "type": "string",
                  "description": ""
                }
              }
            }
          }
        },
        "aliases": []
      }
    }
  }

  const handlePostNode = async () => {
    setNodePosting(true)
    setNodeResult(null)
    setError('')
    try {
      const res = await createOrUpdateNode(exactNodeBody)
      setNodeResult(res)
      if (typeof onWorkflowRefresh === 'function') {
        await onWorkflowRefresh()
      }
    } catch (err) {
      setError(err.message || 'Node post failed')
    } finally {
      setNodePosting(false)
    }
  }

  return (
    <div className="h-full w-full bg-gray-900 text-white p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Upload PDF's</h3>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <label className="block text-sm text-gray-300 mb-2">Select a PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
          />
          <button
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="mt-4 px-4 py-2 rounded-md bg-blue-600 disabled:bg-blue-600/50 hover:bg-blue-500 transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-md border border-red-700 bg-red-900/30 text-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold mb-2">Upload Result</h4>
            <p className="text-green-300 mb-4">{result.message}</p>
            {Array.isArray(result.resources) && result.resources.length > 0 && (
              <div className="space-y-3">
                {result.resources.map((r) => (
                  <div key={r.id} className="border border-gray-700 rounded-md p-4 bg-gray-900">
                    <div className="text-sm text-gray-400">ID: <span className="text-gray-200">{r.id}</span></div>
                    <div className="text-sm text-gray-400">Original Filename: <span className="text-gray-200">{r.original_filename}</span></div>
                    <div className="text-sm text-gray-400">Stored Path: <span className="text-gray-200">{r.pdf_file}</span></div>
                    <div className="text-sm text-gray-400">Status: <span className="text-gray-200">{r.status}</span></div>
                    <div className="text-sm text-gray-400">Created At: <span className="text-gray-200">{r.created_at}</span></div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handlePostNode}
                disabled={nodePosting}
                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 transition-colors"
              >
                {nodePosting ? 'Posting Node...' : 'Post Node JSON'}
              </button>
              {nodeResult && (
                <pre className="mt-4 text-sm bg-black/30 p-3 rounded border border-gray-700 overflow-auto">
{JSON.stringify(nodeResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


