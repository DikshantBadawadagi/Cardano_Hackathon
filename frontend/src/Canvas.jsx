// import React, { useState, useCallback } from 'react';
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   BackgroundVariant,
//   useReactFlow,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Plus, Trash2 } from 'lucide-react';

// import ConversationNode from './ConversationNode';
// import CustomEdge from './EdgeComponent';
// import NodeContextMenu from './NodeContextMenu';
// import { createOrUpdateNode, deleteNode, createOrUpdateEdge, deleteEdge } from './utils/api';

// // Node types - only import and register the components
// const nodeTypes = {
//   conversation: ConversationNode,
// };

// // Edge types - only import and register the components
// const edgeTypes = {
//   custom: CustomEdge,
// };

// export default function WorkflowCanvas() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const { screenToFlowPosition } = useReactFlow();
  
//   // Dialog states
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [selectedNodeType, setSelectedNodeType] = useState(null);
//   const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
//   // Context menu state
//   const [contextMenu, setContextMenu] = useState(null);
  
//   // Edge creation states
//   const [edgeConditionPrompt, setEdgeConditionPrompt] = useState('');

//   // Form states for conversation node
//   const [nodeName, setNodeName] = useState('');
//   const [prompt, setPrompt] = useState('');
//   const [firstMessage, setFirstMessage] = useState('');
//   const [isStart, setIsStart] = useState(false);
//   const [variables, setVariables] = useState([]);

//   // Variable form state
//   const [newVariable, setNewVariable] = useState({
//     title: '',
//     description: '',
//     type: 'string'
//   });

//   // Handle node click for context menu
//   const handleNodeClick = useCallback((nodeId, nodeData, clickPosition) => {
//     setContextMenu({
//       nodeId,
//       nodeData,
//       position: clickPosition
//     });
//   }, []);

//   // Handle edge delete
//   const handleEdgeDelete = useCallback(async (edgeId, edgeData) => {
//     try {
//       await deleteEdge(edgeData);
//       setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
//       console.log('Edge deleted successfully');
//     } catch (error) {
//       console.error('Failed to delete edge:', error);
//     }
//   }, [setEdges]);

//   // Handle node delete
//   const handleNodeDelete = useCallback(async () => {
//     if (!contextMenu) return;
    
//     try {
//       await deleteNode(contextMenu.nodeData);
//       setNodes((nodes) => nodes.filter((node) => node.id !== contextMenu.nodeId));
//       console.log('Node deleted successfully');
//     } catch (error) {
//       console.error('Failed to delete node:', error);
//     }
    
//     setContextMenu(null);
//   }, [contextMenu, setNodes]);

//   // Handle connection
//   const onConnect = useCallback((connection) => {
//     // Find source and target nodes
//     const sourceNode = nodes.find(n => n.id === connection.source);
//     const targetNode = nodes.find(n => n.id === connection.target);
    
//     if (!sourceNode || !targetNode) return;

//     // Create edge data for backend
//     const edgeData = {
//       from: sourceNode.data.nodeData.name,
//       to: targetNode.data.nodeData.name,
//       condition: {
//         type: "ai",
//         prompt: edgeConditionPrompt || "Default condition"
//       }
//     };

//     // Create edge for React Flow
//     const newEdge = {
//       ...connection,
//       id: `edge-${Date.now()}`,
//       type: 'custom',
//       data: {
//         edgeData,
//         onEdgeDelete: handleEdgeDelete
//       }
//     };

//     setEdges((edges) => addEdge(newEdge, edges));
    
//     // Save to backend
//     createOrUpdateEdge(edgeData)
//       .then(() => {
//         console.log('Edge created successfully');
//       })
//       .catch(error => {
//         console.error('Failed to create edge:', error);
//       });

//     setEdgeConditionPrompt('');
//   }, [nodes, edgeConditionPrompt, setEdges, handleEdgeDelete]);

//   // Reset form
//   const resetForm = () => {
//     setNodeName('');
//     setPrompt('');
//     setFirstMessage('');
//     setIsStart(false);
//     setVariables([]);
//     setNewVariable({ title: '', description: '', type: 'string' });
//   };

//   // Handle node type selection
//   const handleNodeTypeSelect = (type) => {
//     setSelectedNodeType(type);
//     setIsCreateDialogOpen(false);
//     setIsConfigDialogOpen(true);
//   };

//   // Add variable
//   const addVariable = () => {
//     if (newVariable.title.trim()) {
//       setVariables([...variables, { ...newVariable, enum: [] }]);
//       setNewVariable({ title: '', description: '', type: 'string' });
//     }
//   };

//   // Remove variable
//   const removeVariable = (index) => {
//     setVariables(variables.filter((_, i) => i !== index));
//   };

//   // Create node
//   const createNode = async () => {
//     if (!nodeName.trim()) return;

//     // Get actual position from flow (center of canvas)
//     const position = screenToFlowPosition({ x: 400, y: 300 });

//     // Create node data for backend
//     const nodeData = {
//       name: nodeName,
//       type: 'conversation',
//       isStart: isStart,
//       metadata: {
//         position: {
//           x: position.x,
//           y: position.y
//         }
//       },
//       prompt: prompt,
//       messagePlan: {
//         firstMessage: firstMessage
//       }
//     };

//     // Add variableExtractionPlan if variables exist
//     if (variables.length > 0) {
//       nodeData.variableExtractionPlan = {
//         output: variables
//       };
//     }

//     // Create node for React Flow
//     const newNode = {
//       id: `node-${Date.now()}`,
//       type: 'conversation',
//       position: position,
//       data: { 
//         nodeData,
//         onNodeClick: handleNodeClick
//       }
//     };

//     // Save to backend first
//     try {
//       await createOrUpdateNode(nodeData);
//       setNodes((nds) => [...nds, newNode]);
//       console.log('Node created successfully');
//     } catch (error) {
//       console.error('Failed to create node:', error);
//     }

//     setIsConfigDialogOpen(false);
//     resetForm();
//   };

//   return (
//     <div className="w-full h-screen bg-gray-900">
//       {/* Top Bar */}
//       <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
//         <h1 className="text-white text-xl font-semibold">Workflow Builder</h1>
        
//         <div className="flex items-center gap-2">
//           {/* Edge Condition Input */}
//           <Input
//             placeholder="Edge condition prompt..."
//             value={edgeConditionPrompt}
//             onChange={(e) => setEdgeConditionPrompt(e.target.value)}
//             className="w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
//           />
          
//           {/* Create Node Dialog */}
//           <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="bg-blue-600 hover:bg-blue-700">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Node
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Select Node Type</DialogTitle>
//               </DialogHeader>
//               <div className="grid grid-cols-2 gap-4 mt-4">
//                 <Button 
//                   onClick={() => handleNodeTypeSelect('conversation')}
//                   className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
//                 >
//                   <div className="text-lg font-semibold">Conversation</div>
//                   <div className="text-sm opacity-80">Interactive dialogue node</div>
//                 </Button>
//                 <Button 
//                   onClick={() => handleNodeTypeSelect('tool')}
//                   className="h-20 flex-col bg-green-600 hover:bg-green-700"
//                   disabled
//                 >
//                   <div className="text-lg font-semibold">Tool</div>
//                   <div className="text-sm opacity-80">Coming soon...</div>
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Node Configuration Dialog */}
//       <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
//         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Configure Conversation Node</DialogTitle>
//           </DialogHeader>
          
//           <div className="space-y-4 mt-4">
//             {/* Basic Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="nodeName">Node Name *</Label>
//                 <Input
//                   id="nodeName"
//                   value={nodeName}
//                   onChange={(e) => setNodeName(e.target.value)}
//                   placeholder="e.g., introduction"
//                 />
//               </div>
//               <div className="flex items-center space-x-2 pt-6">
//                 <Checkbox 
//                   id="isStart" 
//                   checked={isStart}
//                   onCheckedChange={setIsStart}
//                 />
//                 <Label htmlFor="isStart">Start Node</Label>
//               </div>
//             </div>

//             {/* Prompt */}
//             <div>
//               <Label htmlFor="prompt">Prompt</Label>
//               <Textarea
//                 id="prompt"
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 placeholder="e.g., You are a helpful assistant"
//                 rows={3}
//               />
//             </div>

//             {/* First Message */}
//             <div>
//               <Label htmlFor="firstMessage">First Message</Label>
//               <Textarea
//                 id="firstMessage"
//                 value={firstMessage}
//                 onChange={(e) => setFirstMessage(e.target.value)}
//                 placeholder="e.g., Hey there!"
//                 rows={2}
//               />
//             </div>

//             {/* Variables Section */}
//             <div>
//               <Label className="text-base font-semibold">Variable Extraction (Optional)</Label>
              
//               {/* Add New Variable */}
//               <div className="mt-2 p-4 border rounded-lg bg-gray-50">
//                 <div className="grid grid-cols-3 gap-2 mb-2">
//                   <Input
//                     placeholder="Variable name"
//                     value={newVariable.title}
//                     onChange={(e) => setNewVariable({...newVariable, title: e.target.value})}
//                   />
//                   <Input
//                     placeholder="Description"
//                     value={newVariable.description}
//                     onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
//                   />
//                   <select
//                     className="px-3 py-2 border rounded-md"
//                     value={newVariable.type}
//                     onChange={(e) => setNewVariable({...newVariable, type: e.target.value})}
//                   >
//                     <option value="string">String</option>
//                     <option value="number">Number</option>
//                   </select>
//                 </div>
//                 <Button onClick={addVariable} size="sm" className="w-full">
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Variable
//                 </Button>
//               </div>

//               {/* Variables List */}
//               {variables.length > 0 && (
//                 <div className="mt-2 space-y-2">
//                   {variables.map((variable, index) => (
//                     <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
//                       <div>
//                         <span className="font-medium">{variable.title}</span>
//                         <span className="text-gray-500 ml-2">({variable.type})</span>
//                         {variable.description && (
//                           <div className="text-sm text-gray-600">{variable.description}</div>
//                         )}
//                       </div>
//                       <Button 
//                         onClick={() => removeVariable(index)}
//                         size="sm" 
//                         variant="destructive"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Create Button */}
//             <Button 
//               onClick={createNode} 
//               className="w-full"
//               disabled={!nodeName.trim()}
//             >
//               Create Node
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Context Menu */}
//       <NodeContextMenu
//         position={contextMenu?.position}
//         onDelete={handleNodeDelete}
//         onClose={() => setContextMenu(null)}
//       />

//       {/* React Flow Canvas */}
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         nodeTypes={nodeTypes}
//         edgeTypes={edgeTypes}
//         className="bg-gray-900"
//       >
//         <Background 
//           variant={BackgroundVariant.Dots}
//           gap={20}
//           size={1}
//           color="#374151"
//         />
//         <Controls className="bg-gray-800 border-gray-700" />
//         <MiniMap 
//           className="bg-gray-800 border-gray-700"
//           maskColor="rgba(0, 0, 0, 0.2)"
//         />
//       </ReactFlow>
//     </div>
//   );
// }


import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, X } from 'lucide-react';

import ConversationNode from './ConversationNode';
import ToolNode from './ToolNode';
import CustomEdge from './EdgeComponent';
import NodeContextMenu from './NodeContextMenu';
import { 
  createOrUpdateNode, 
  deleteNode, 
  createOrUpdateEdge, 
  deleteEdge,
  getCurrentWorkspace,
  getCurrentWorkflow 
} from './utils/api';
import { loadWorkflowForReactFlow, refreshWorkflowData } from './utils/workflowLoader';

// Node types - import and register both components
const nodeTypes = {
  conversation: ConversationNode,
  tool: ToolNode,
};

// Edge types - only import and register the components
const edgeTypes = {
  custom: CustomEdge,
};

export default function WorkflowCanvas({ workspaceId, workflowId, onProvideRefresh }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  
  // Edge condition dialog states
  const [isEdgeConditionDialogOpen, setIsEdgeConditionDialogOpen] = useState(false);
  const [pendingEdgeConnection, setPendingEdgeConnection] = useState(null);
  const [edgeConditionPrompt, setEdgeConditionPrompt] = useState('');

  // Form states for conversation node
  const [nodeName, setNodeName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [isStart, setIsStart] = useState(false);
  const [variables, setVariables] = useState([]);

  // Variable form state
  const [newVariable, setNewVariable] = useState({
    title: '',
    description: '',
    type: 'string'
  });

  // Tool node form states
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [toolMethod, setToolMethod] = useState('POST');
  const [bodyVariables, setBodyVariables] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [responseVariables, setResponseVariables] = useState([]);

  // New variable states for tool
  const [newBodyVariable, setNewBodyVariable] = useState({
    name: '',
    type: 'string',
    default: '',
    description: ''
  });

  const [newHeader, setNewHeader] = useState({
    key: '',
    value: '',
    type: 'string'
  });

  const [newResponseVariable, setNewResponseVariable] = useState({
    name: '',
    type: 'string',
    description: '',
    required: false
  });

  // Get workspace/workflow IDs - prefer props, fall back to context
  const wsId = workspaceId || getCurrentWorkspace();
  const wfId = workflowId || getCurrentWorkflow();

  // Handle node click for context menu
  const handleNodeClick = useCallback((nodeId, nodeData, clickPosition) => {
    setContextMenu({
      nodeId,
      nodeData,
      position: clickPosition
    });
  }, []);

  // Handle edge delete
  const handleEdgeDelete = useCallback(async (edgeId, edgeData) => {
    try {
      await deleteEdge(wsId, wfId, edgeData);
      setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
      console.log('Edge deleted successfully');
    } catch (error) {
      console.error('Failed to delete edge:', error);
    }
  }, [setEdges, wsId, wfId]);

  // Handle node delete
  const handleNodeDelete = useCallback(async () => {
    if (!contextMenu) return;
    
    try {
      await deleteNode(wsId, wfId, contextMenu.nodeData);
      setNodes((nodes) => nodes.filter((node) => node.id !== contextMenu.nodeId));
      console.log('Node deleted successfully');
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
    
    setContextMenu(null);
  }, [contextMenu, setNodes, wsId, wfId]);

  // Load workflow data on component mount or when IDs change
  useEffect(() => {
    const loadInitialWorkflow = async () => {
      if (!wsId || !wfId) {
        console.log('No workspace or workflow selected');
        setNodes([]);
        setEdges([]);
        return;
      }
      
      try {
        const { nodes, edges } = await loadWorkflowForReactFlow(wsId, wfId, handleNodeClick, handleEdgeDelete);
        setNodes(nodes);
        setEdges(edges);
        console.log('Initial workflow loaded successfully');
      } catch (error) {
        console.error('Failed to load initial workflow:', error);
      }
    };

    loadInitialWorkflow();
  }, [wsId, wfId, handleNodeClick, handleEdgeDelete]);

  // Handle node drag stop - save position to MongoDB
  const handleNodeDragStop = useCallback(async (event, node) => {
    if (!wsId || !wfId || !node.data?.nodeData) return;

    // Update the nodeData with new position
    const updatedNodeData = {
      ...node.data.nodeData,
      metadata: {
        ...node.data.nodeData.metadata,
        position: {
          x: node.position.x,
          y: node.position.y
        }
      }
    };

    try {
      await createOrUpdateNode(wsId, wfId, updatedNodeData);
      console.log(`Node "${updatedNodeData.name}" position saved to MongoDB`);
    } catch (error) {
      console.error('Failed to save node position:', error);
    }
  }, [wsId, wfId]);

  // Handle connection - opens dialog to get condition
  const onConnect = useCallback((connection) => {
    // Find source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;

    // Store the pending connection and open the dialog
    setPendingEdgeConnection({
      connection,
      sourceNode,
      targetNode
    });
    setEdgeConditionPrompt('');
    setIsEdgeConditionDialogOpen(true);
  }, [nodes]);

  // Confirm edge creation with the condition
  const handleEdgeConditionConfirm = useCallback(() => {
    if (!pendingEdgeConnection) return;

    const { connection, sourceNode, targetNode } = pendingEdgeConnection;

    // Create edge data for backend
    const edgeData = {
      from: sourceNode.data.nodeData.name,
      to: targetNode.data.nodeData.name,
      condition: {
        type: "ai",
        prompt: edgeConditionPrompt || "Default condition"
      }
    };

    // Create edge for React Flow
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'custom',
      data: {
        edgeData,
        onEdgeDelete: handleEdgeDelete
      }
    };

    setEdges((edges) => addEdge(newEdge, edges));
    
    // Save to backend
    createOrUpdateEdge(wsId, wfId, edgeData)
      .then(() => {
        console.log('Edge created successfully');
      })
      .catch(error => {
        console.error('Failed to create edge:', error);
      });

    // Close dialog and reset state
    setIsEdgeConditionDialogOpen(false);
    setPendingEdgeConnection(null);
    setEdgeConditionPrompt('');
  }, [pendingEdgeConnection, edgeConditionPrompt, setEdges, handleEdgeDelete, wsId, wfId]);

  // Cancel edge creation
  const handleEdgeConditionCancel = useCallback(() => {
    setIsEdgeConditionDialogOpen(false);
    setPendingEdgeConnection(null);
    setEdgeConditionPrompt('');
  }, []);

  // Reset form
  const resetForm = () => {
    setNodeName('');
    setPrompt('');
    setFirstMessage('');
    setIsStart(false);
    setVariables([]);
    setNewVariable({ title: '', description: '', type: 'string' });
    
    // Reset tool form
    setToolName('');
    setToolUrl('');
    setToolMethod('POST');
    setBodyVariables([]);
    setHeaders([]);
    setResponseVariables([]);
    setNewBodyVariable({ name: '', type: 'string', default: '', description: '' });
    setNewHeader({ key: '', value: '', type: 'string' });
    setNewResponseVariable({ name: '', type: 'string', description: '', required: false });
  };


  const handleWorkflowRefresh = useCallback(async () => {
    await refreshWorkflowData(setNodes, setEdges, handleNodeClick, handleEdgeDelete, wsId, wfId);
  }, [setNodes, setEdges, handleNodeClick, handleEdgeDelete, wsId, wfId]);

 
  useEffect(() => {
    if (typeof onProvideRefresh === 'function') {
      onProvideRefresh(handleWorkflowRefresh);
    }
  }, [onProvideRefresh, handleWorkflowRefresh]);



  // Handle node type selection
  const handleNodeTypeSelect = (type) => {
    setSelectedNodeType(type);
    setIsCreateDialogOpen(false);
    setIsConfigDialogOpen(true);
  };

  // Add variable (conversation node)
  const addVariable = () => {
    if (newVariable.title.trim()) {
      setVariables([...variables, { ...newVariable, enum: [] }]);
      setNewVariable({ title: '', description: '', type: 'string' });
    }
  };

  // Remove variable (conversation node)
  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  // Add body variable (tool node)
  const addBodyVariable = () => {
    if (newBodyVariable.name.trim()) {
      setBodyVariables([...bodyVariables, { ...newBodyVariable }]);
      setNewBodyVariable({ name: '', type: 'string', default: '', description: '' });
    }
  };

  // Remove body variable
  const removeBodyVariable = (index) => {
    setBodyVariables(bodyVariables.filter((_, i) => i !== index));
  };

  // Add header (tool node)
  const addHeader = () => {
    if (newHeader.key.trim() && newHeader.value.trim()) {
      setHeaders([...headers, { ...newHeader }]);
      setNewHeader({ key: '', value: '', type: 'string' });
    }
  };

  // Remove header
  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // Add response variable (tool node)
  const addResponseVariable = () => {
    if (newResponseVariable.name.trim()) {
      setResponseVariables([...responseVariables, { ...newResponseVariable }]);
      setNewResponseVariable({ name: '', type: 'string', description: '', required: false });
    }
  };

  // Remove response variable
  const removeResponseVariable = (index) => {
    setResponseVariables(responseVariables.filter((_, i) => i !== index));
  };

  // Create conversation node
  const createConversationNode = async () => {
    if (!nodeName.trim()) return;

    const position = screenToFlowPosition({ x: 400, y: 300 });

    const nodeData = {
      name: nodeName,
      type: 'conversation',
      isStart: isStart,
      metadata: {
        position: {
          x: position.x,
          y: position.y
        }
      },
      prompt: prompt,
      messagePlan: {
        firstMessage: firstMessage
      }
    };

    if (variables.length > 0) {
      nodeData.variableExtractionPlan = {
        output: variables
      };
    }

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'conversation',
      position: position,
      data: { 
        nodeData,
        onNodeClick: handleNodeClick
      }
    };

    try {
      await createOrUpdateNode(wsId, wfId, nodeData);
      setNodes((nds) => [...nds, newNode]);
      console.log('Conversation node created successfully');
    } catch (error) {
      console.error('Failed to create conversation node:', error);
    }

    setIsConfigDialogOpen(false);
    resetForm();
  };

  // Create tool node
  const createToolNode = async () => {
    if (!nodeName.trim() || !toolName.trim() || !toolUrl.trim()) return;

    const position = screenToFlowPosition({ x: 400, y: 300 });

    // Build body properties
    const bodyProperties = {};
    bodyVariables.forEach(variable => {
      bodyProperties[variable.name] = {
        type: variable.type,
        default: variable.default,
        description: variable.description
      };
    });

    // Build headers properties
    const headerProperties = {};
    headers.forEach(header => {
      headerProperties[header.key] = {
        type: header.type,
        value: header.value
      };
    });

    // Build response variables schema
    const responseProperties = {};
    const requiredResponseVars = [];
    responseVariables.forEach(variable => {
      responseProperties[variable.name] = {
        type: variable.type,
        description: variable.description
      };
      if (variable.required) {
        requiredResponseVars.push(variable.name);
      }
    });

    const nodeData = {
      name: nodeName,
      type: 'tool',
      metadata: {
        position: {
          x: position.x,
          y: position.y
        }
      },
      tool: {
         url: toolUrl,
        ...(Object.keys(bodyProperties).length > 0 && {
          body: {
            type: "object",
            required: [],
            properties: bodyProperties
          }
        }),
        name: toolName,
        type: "apiRequest",
        method: toolMethod,
        ...(Object.keys(headerProperties).length > 0 && {
          headers: {
            type: "object",
            properties: headerProperties
          }
        }),
        function: {
          name: "api_request_tool",
          parameters: {
            type: "object",
            required: [],
            properties: {}
          },
          description: "API request tool"
        },
        messages: [
          {
            type: "request-start",
            blocking: false
          }
        ],
        variableExtractionPlan: {
          schema: {
            type: "object",
            required: requiredResponseVars,
            properties: responseProperties
          },
          aliases: []
        }
      }
    };

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'tool',
      position: position,
      data: { 
        nodeData,
        onNodeClick: handleNodeClick
      }
    };

    try {
      await createOrUpdateNode(wsId, wfId, nodeData);
      setNodes((nds) => [...nds, newNode]);
      console.log('Tool node created successfully');
    } catch (error) {
      console.error('Failed to create tool node:', error);
    }

    setIsConfigDialogOpen(false);
    resetForm();
  };

  // Create node (router function)
  const createNode = () => {
    if (selectedNodeType === 'conversation') {
      createConversationNode();
    } else if (selectedNodeType === 'tool') {
      createToolNode();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">Workflow Builder</h1>
        
        <div className="flex items-center gap-2">
          {/* Create Node Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Node
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Node Type</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button 
                  onClick={() => handleNodeTypeSelect('conversation')}
                  className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
                >
                  <div className="text-lg font-semibold">Conversation</div>
                  <div className="text-sm opacity-80">Interactive dialogue node</div>
                </Button>
                <Button 
                  onClick={() => handleNodeTypeSelect('tool')}
                  className="h-20 flex-col bg-green-600 hover:bg-green-700"
                >
                  <div className="text-lg font-semibold">Tool</div>
                  <div className="text-sm opacity-80">API request node</div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Node Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNodeType === 'conversation' ? 'Configure Conversation Node' : 'Configure Tool Node'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Basic Info - Common for both node types */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nodeName">Node Name *</Label>
                <Input
                  id="nodeName"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder={selectedNodeType === 'tool' ? 'e.g., apiRequest_1758641079929' : 'e.g., introduction'}
                />
              </div>
              {selectedNodeType === 'conversation' && (
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox 
                    id="isStart" 
                    checked={isStart}
                    onCheckedChange={setIsStart}
                  />
                  <Label htmlFor="isStart">Start Node</Label>
                </div>
              )}
            </div>

            {/* Conversation Node Fields */}
            {selectedNodeType === 'conversation' && (
              <>
                {/* Prompt */}
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., You are a helpful assistant"
                    rows={3}
                  />
                </div>

                {/* First Message */}
                <div>
                  <Label htmlFor="firstMessage">First Message</Label>
                  <Textarea
                    id="firstMessage"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="e.g., Hey there!"
                    rows={2}
                  />
                </div>

                {/* Variables Section */}
                <div>
                  <Label className="text-base font-semibold">Variable Extraction (Optional)</Label>
                  
                  {/* Add New Variable */}
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Variable name"
                        value={newVariable.title}
                        onChange={(e) => setNewVariable({...newVariable, title: e.target.value})}
                      />
                      <Input
                        placeholder="Description"
                        value={newVariable.description}
                        onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={newVariable.type}
                        onChange={(e) => setNewVariable({...newVariable, type: e.target.value})}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <Button onClick={addVariable} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>

                  {/* Variables List */}
                  {variables.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {variables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div>
                            <span className="font-medium">{variable.title}</span>
                            <span className="text-gray-500 ml-2">({variable.type})</span>
                            {variable.description && (
                              <div className="text-sm text-gray-600">{variable.description}</div>
                            )}
                          </div>
                          <Button 
                            onClick={() => removeVariable(index)}
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tool Node Fields */}
            {selectedNodeType === 'tool' && (
              <>
                {/* Tool Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="toolName">Tool Name *</Label>
                    <Input
                      id="toolName"
                      value={toolName}
                      onChange={(e) => setToolName(e.target.value)}
                      placeholder="e.g., sendComplaintData"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toolMethod">HTTP Method *</Label>
                    <select
                      id="toolMethod"
                      className="w-full px-3 py-2 border rounded-md"
                      value={toolMethod}
                      onChange={(e) => setToolMethod(e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>

                {/* Tool URL */}
                <div>
                  <Label htmlFor="toolUrl">API URL *</Label>
                  <Input
                    id="toolUrl"
                    value={toolUrl}
                    onChange={(e) => setToolUrl(e.target.value)}
                    placeholder="e.g., https://hooks.zapier.com/hooks/catch/24717478/u1h9zsy/"
                  />
                </div>

                {/* Body Variables Section */}
                <div>
                  <Label className="text-base font-semibold">Body Variables</Label>
                  
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <Input
                        placeholder="Variable name"
                        value={newBodyVariable.name}
                        onChange={(e) => setNewBodyVariable({...newBodyVariable, name: e.target.value})}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={newBodyVariable.type}
                        onChange={(e) => setNewBodyVariable({...newBodyVariable, type: e.target.value})}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <Input
                        placeholder="Default value"
                        value={newBodyVariable.default}
                        onChange={(e) => setNewBodyVariable({...newBodyVariable, default: e.target.value})}
                      />
                      <Input
                        placeholder="Description"
                        value={newBodyVariable.description}
                        onChange={(e) => setNewBodyVariable({...newBodyVariable, description: e.target.value})}
                      />
                    </div>
                    <Button onClick={addBodyVariable} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Body Variable
                    </Button>
                  </div>

                  {bodyVariables.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {bodyVariables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div>
                            <span className="font-medium">{variable.name}</span>
                            <span className="text-gray-500 ml-2">({variable.type})</span>
                            {variable.description && (
                              <div className="text-sm text-gray-600">{variable.description}</div>
                            )}
                            {variable.default && (
                              <div className="text-xs text-gray-500">Default: {variable.default}</div>
                            )}
                          </div>
                          <Button 
                            onClick={() => removeBodyVariable(index)}
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Headers Section */}
                <div>
                  <Label className="text-base font-semibold">Headers (Optional)</Label>
                  
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Header key (e.g., Content-Type)"
                        value={newHeader.key}
                        onChange={(e) => setNewHeader({...newHeader, key: e.target.value})}
                      />
                      <Input
                        placeholder="Header value"
                        value={newHeader.value}
                        onChange={(e) => setNewHeader({...newHeader, value: e.target.value})}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={newHeader.type}
                        onChange={(e) => setNewHeader({...newHeader, type: e.target.value})}
                      >
                        <option value="string">String</option>
                      </select>
                    </div>
                    <Button onClick={addHeader} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Header
                    </Button>
                  </div>

                  {headers.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {headers.map((header, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div>
                            <span className="font-medium">{header.key}:</span>
                            <span className="text-gray-600 ml-2">{header.value}</span>
                          </div>
                          <Button 
                            onClick={() => removeHeader(index)}
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Response Variables Section */}
                <div>
                  <Label className="text-base font-semibold">Response Variables to Extract</Label>
                  
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <Input
                        placeholder="Variable name"
                        value={newResponseVariable.name}
                        onChange={(e) => setNewResponseVariable({...newResponseVariable, name: e.target.value})}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={newResponseVariable.type}
                        onChange={(e) => setNewResponseVariable({...newResponseVariable, type: e.target.value})}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <Input
                        placeholder="Description"
                        value={newResponseVariable.description}
                        onChange={(e) => setNewResponseVariable({...newResponseVariable, description: e.target.value})}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`required-${newResponseVariable.name}`}
                          checked={newResponseVariable.required}
                          onCheckedChange={(checked) => setNewResponseVariable({...newResponseVariable, required: checked})}
                        />
                        <Label htmlFor={`required-${newResponseVariable.name}`} className="text-sm">Required</Label>
                      </div>
                    </div>
                    <Button onClick={addResponseVariable} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Response Variable
                    </Button>
                  </div>

                  {responseVariables.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {responseVariables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div>
                            <span className="font-medium">{variable.name}</span>
                            <span className="text-gray-500 ml-2">({variable.type})</span>
                            {variable.required && <span className="text-red-600 ml-1">*</span>}
                            {variable.description && (
                              <div className="text-sm text-gray-600">{variable.description}</div>
                            )}
                          </div>
                          <Button 
                            onClick={() => removeResponseVariable(index)}
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Create Button */}
            <Button 
              onClick={createNode} 
              className="w-full"
              disabled={!nodeName.trim() || (selectedNodeType === 'tool' && (!toolName.trim() || !toolUrl.trim()))}
            >
              Create {selectedNodeType === 'conversation' ? 'Conversation' : 'Tool'} Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edge Condition Dialog */}
      <Dialog open={isEdgeConditionDialogOpen} onOpenChange={(open) => {
        if (!open) handleEdgeConditionCancel();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Edge Condition</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {pendingEdgeConnection && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="font-medium">Connecting:</span>{' '}
                <span className="text-blue-600">{pendingEdgeConnection.sourceNode.data.nodeData.name}</span>
                {' → '}
                <span className="text-green-600">{pendingEdgeConnection.targetNode.data.nodeData.name}</span>
              </div>
            )}
            
            <div>
              <Label htmlFor="edgeCondition">Condition Prompt</Label>
              <Textarea
                id="edgeCondition"
                value={edgeConditionPrompt}
                onChange={(e) => setEdgeConditionPrompt(e.target.value)}
                placeholder="e.g., User wants to proceed with booking"
                rows={3}
                className="mt-1"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe when this path should be taken (AI will evaluate this condition)
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleEdgeConditionCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdgeConditionConfirm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Edge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      <NodeContextMenu
        position={contextMenu?.position}
        onDelete={handleNodeDelete}
        onClose={() => setContextMenu(null)}
      />

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className="bg-gray-900"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
        />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap 
          className="bg-gray-800 border-gray-700"
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
}