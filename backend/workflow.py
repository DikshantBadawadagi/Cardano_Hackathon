# This file contains the Python classes to build Vapi workflow JSON programmatically.
# This makes it easier to create complex workflows without manually writing JSON.
import json

class VapiNode:
    """A base class for all Vapi workflow nodes."""
    def __init__(self, name, node_type, is_start=False, prompt="", metadata=None):
        self.name = name
        self.type = node_type
        self.is_start = is_start
        self.prompt = prompt
        self.metadata = metadata if metadata else {}
        self.toolIds = []

    def to_dict(self):
        """Converts the node object to a dictionary for JSON serialization."""
        return {
            "name": self.name,
            "type": self.type,
            "isStart": self.is_start,
            "prompt": self.prompt,
            "metadata": self.metadata,
            "toolIds": self.toolIds,
        }

class ConversationNode(VapiNode):
    """Represents a 'conversation' node in a Vapi workflow."""
    def __init__(self, name, is_start=False, prompt="", first_message="", variable_extraction_plan=None):
        super().__init__(name, "conversation", is_start=is_start, prompt=prompt)
        self.message_plan = {"firstMessage": first_message}
        self.variable_extraction_plan = variable_extraction_plan if variable_extraction_plan else {"output": []}

    def add_variable(self, var_name, var_type, description, enum=None):
        """Adds a variable to be extracted from the conversation."""
        variable = {
            "title": var_name,
            "type": var_type,
            "description": description,
        }
        if enum:
            variable["enum"] = enum
        self.variable_extraction_plan["output"].append(variable)

    def to_dict(self):
        """Converts the ConversationNode object to a dictionary."""
        node_dict = super().to_dict()
        node_dict["messagePlan"] = self.message_plan
        node_dict["variableExtractionPlan"] = self.variable_extraction_plan
        return node_dict

class ToolNode(VapiNode):
    """Represents a 'tool' node that invokes an external API."""
    def __init__(self, name, url, method, body, tool_name, is_start=False, prompt=""):
        super().__init__(name, "tool", is_start=is_start, prompt=prompt)
        self.tool = {
            "url": url,
            "body": body,
            "name": tool_name,
            "type": "apiRequest",
            "method": method,
            "function": {"name": "api_request_tool", "parameters": {"type": "object", "required": [], "properties": {}}, "description": "API request tool"},
            "messages": [{"type": "request-start", "blocking": False}],
            "variableExtractionPlan": {"schema": {"type": "object", "required": [], "properties": {}}, "aliases": []},
        }

    def to_dict(self):
        """Converts the ToolNode object to a dictionary."""
        node_dict = super().to_dict()
        node_dict["tool"] = self.tool
        return node_dict

class VapiEdge:
    """Represents an 'edge' connecting two nodes in a Vapi workflow."""
    def __init__(self, from_node, to_node, condition_prompt):
        self.from_node = from_node.name
        self.to_node = to_node.name
        self.condition = {
            "type": "ai",
            "prompt": condition_prompt
        }

    def to_dict(self):
        """Converts the edge object to a dictionary."""
        return {
            "from": self.from_node,
            "to": self.to_node,
            "condition": self.condition
        }

def build_demo_workflow():
    """Builds a sample workflow as a Python dictionary."""
    
    # Define a custom webhook URL for your backend or a service like Zapier
    webhook_url = "https://hooks.zapier.com/hooks/catch/24717478/u1h9zsy/"

    # --- NODES ---
    # 1. Introduction Node (Start Node)
    intro_node = ConversationNode(
        name="introduction",
        is_start=True,
        prompt="You are Dhruv, the friendly booking assistant for Padhiar & Company. Your goal is to identify the customer's intent: booking an appointment, lodging a complaint, or asking a general question. Keep your responses concise and human-like.",
        first_message="Welcome to Padhiar & Company, how may I help you today?"
    )
    
    # 2. Existing Customer Intent Node
    existing_customer_node = ConversationNode(
        name="existing_customer_intent",
        prompt="You are speaking with an existing customer. Ask for their name and email, then ask if they want to lodge a complaint, book another service, or check on a past project.",
        first_message="I see you're a returning customer. Please tell me your name and email. How can I assist you further?"
    )
    existing_customer_node.add_variable("name", "string", "The user's name")
    existing_customer_node.add_variable("email", "string", "The user's email address")

    # 3. New Customer Intent Node
    new_customer_node = ConversationNode(
        name="new_customer_intent",
        prompt="You are speaking with a new customer. Ask for their name and email, then find out if they want to book an appointment or receive a brochure.",
        first_message="It's a pleasure to meet you! Could I please get your name and email to get started? Are you interested in booking an appointment or receiving a company brochure?"
    )
    new_customer_node.add_variable("name", "string", "The user's name")
    new_customer_node.add_variable("email", "string", "The user's email address")
    
    # 4. Brochure Tool Node
    brochure_tool_node = ToolNode(
        name="send_brochure",
        url=webhook_url,
        method="POST",
        body={
            "type": "object",
            "required": ["email"],
            "properties": {
                "email": {
                    "type": "string",
                    "default": "{{email}}",
                    "description": "The user's email address to send the brochure to."
                }
            }
        },
        tool_name="sendBrochureEmail"
    )

    # --- EDGES ---
    # Edge from introduction to existing customer flow
    edge1 = VapiEdge(intro_node, existing_customer_node, "If the user is an existing customer.")
    
    # Edge from introduction to new customer flow
    edge2 = VapiEdge(intro_node, new_customer_node, "If the user is a new customer.")

    # Edge for new customer to brochure tool
    edge3 = VapiEdge(new_customer_node, brochure_tool_node, "If the user wants to see the company brochure or testimonials.")

    return {
        "name": "Maukikh Project Workflow",
        "nodes": [
            intro_node.to_dict(),
            existing_customer_node.to_dict(),
            new_customer_node.to_dict(),
            brochure_tool_node.to_dict(),
        ],
        "edges": [
            edge1.to_dict(),
            edge2.to_dict(),
            edge3.to_dict(),
        ]
    }
