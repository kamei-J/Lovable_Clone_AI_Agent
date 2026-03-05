# Lovable Clone AI Agent

An intelligent AI agent system that automatically generates complete web applications from natural language prompts. Built with LangGraph and powered by LLM capabilities, this project creates structured plans, architectures, and implements full-stack applications autonomously.

## 🚀 Features

- **Natural Language to Code**: Converts user prompts into fully functional web applications
- **Multi-Agent Architecture**: 
  - **Planner Agent**: Analyzes requirements and creates structured plans
  - **Architect Agent**: Designs implementation steps and file structures
  - **Coder Agent**: Implements the actual code using ReAct pattern with tools
- **Automated File Management**: Creates and manages project files automatically
- **Structured Output**: Uses Pydantic models for type-safe agent interactions
- **LangGraph Workflow**: Orchestrates agent collaboration with state management

## 📋 Prerequisites

- Python >= 3.12
- UV package manager (recommended) or pip
- Groq API key (for LLM access)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamei-J/Lovable_Clone_AI_Agent.git
   cd Lovable_Clone_AI_Agent
   ```

2. **Install dependencies**
   
   Using UV (recommended):
   ```bash
   uv sync
   ```
   
   Or using pip:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

## 🎯 Usage

### Basic Usage

Run the agent with an interactive prompt:

```bash
python main.py
```

Then enter your project description when prompted:
```
Enter your project prompt: Build a colorful modern todo app in HTML, CSS, and JavaScript
```

### Advanced Usage

Adjust the recursion limit for complex projects:

```bash
python main.py --recursion-limit 150
```

Or use the short form:
```bash
python main.py -r 150
```

## 📁 Project Structure

```
AIagent_Lovable_clone/
├── Agent_related/
│   ├── __init__.py          # Package marker
│   ├── graph.py             # LangGraph workflow definition
│   ├── state.py             # Pydantic schemas and state models
│   ├── prompt.py            # LLM prompts for each agent
│   └── tool.py              # Utility functions and tools
├── Example_generated_todo_project/  # Sample generated output
├── main.py                  # Entry point
├── pyproject.toml           # Project dependencies
├── uv.lock                  # Locked dependencies
├── .python-version          # Python version specification
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🧩 How It Works

1. **Planning Phase**: The Planner Agent analyzes your prompt and creates a structured plan including:
   - App name and description
   - Technology stack
   - Feature list
   - File structure

2. **Architecture Phase**: The Architect Agent transforms the plan into:
   - Concrete implementation steps
   - File-specific tasks
   - Execution order

3. **Implementation Phase**: The Coder Agent:
   - Executes tasks sequentially
   - Uses tools (read_file, write_file, etc.)
   - Implements code based on task descriptions
   - Manages file creation and updates

## 🔧 Core Components

### State Models (state.py)
- `Plan`: High-level project structure
- `TaskPlan`: Detailed implementation steps
- `CoderState`: Tracks implementation progress
- `File`: File metadata
- `ImplementationTask`: Individual coding tasks

### Tools (tool.py)
- `write_file`: Create or update files
- `read_file`: Read existing file content
- `list_file`: List directory contents
- `get_current_directory`: Get current working directory

### Workflow (graph.py)
- Multi-agent graph with conditional edges
- State transitions between planner → architect → coder
- Loop until all implementation steps complete

## 🎨 Example Usage Prompts

- create a simple calculator web application
- create a todo list application using html, css and javascript

## 📦 Dependencies

- **groq**: LLM API integration
- **langchain**: LLM framework
- **langchain-core**: Core LangChain functionality
- **langchain-groq**: Groq-specific integrations
- **langgraph**: Graph-based agent orchestration
- **pydantic**: Data validation and schemas
- **python-dotenv**: Environment variable management





