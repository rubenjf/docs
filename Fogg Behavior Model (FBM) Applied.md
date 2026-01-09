https://ts.accenture.com/:p:/s/AIISproductblueprint/ES7xwNSVe-tHiKBBgV-q4_QBsYsbjky1QHl1T_UHZeUPUw?e=A36Q5# Fogg Behavior Model (FBM) Applied to Agentic AI Systems

## 1. Overview of Fogg Behavior Model (FBM)
The **Fogg Behavior Model (FBM)** is a psychological framework developed by Dr. BJ Fogg that explains behavior as:

**B = MAP**  
- **B** = Behavior  
- **M** = Motivation  
- **A** = Ability  
- **P** = Prompt  

A behavior occurs only when motivation, ability, and prompt converge at the same moment.

### FBM Elements:
- **Motivation:** Emotional, social, or reward-based drives (Pleasure ↔ Pain, Hope ↔ Fear, Social Acceptance ↔ Rejection)  
- **Ability:** Ease of performing the action (Time, Money, Effort, Mental effort, Social norms, Routine)  
- **Prompt:** Trigger or cue to act (external or internal)

Behavior activation is visualized with a curve: actions happen above the threshold (sufficient motivation & ability).

---

## 2. Mapping FBM to Agentic AI Systems

| FBM Concept | Human Context | Agentic AI Analogue |
|-------------|---------------|-------------------|
| Motivation | Desire to act | Reward function / Goal / Objective |
| Ability | Ease of action | Capabilities & Resources (tools, APIs, reasoning) |
| Prompt | Trigger to act | Input / Event (user request, system signal) |

**Agent Behavior Equation:**  
> Behavior = Motivation (reward/objective) × Ability (capability) × Prompt (input/event)

### Behavior Curve Analogy
- High motivation + high ability + prompt → Agent acts  
- Low motivation or low ability → Agent remains idle even if prompted  

### Multi-Agent Extension
- Each agent has its own FBM triangle
- Social prompts and shared motivations influence behavior in ecosystems

---

## 3. Textual Diagram (Conceptual)

### Triangle Representation
```
                  ┌──────────────────────────────┐
                  │        Motivation             │
                  │ (Reward Function / Objective) │
                  └──────────────────────────────┘
                               ▲
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        │                      ▼                      │
┌─────────────────────┐                 ┌────────────────────────┐
│       Ability       │                 │         Prompt         │
│ (Capabilities, APIs,│                 │ (Input/Event Trigger)  │
│  tools, data access)│                 └────────────────────────┘
└─────────────────────┘

                        ▼
            ┌────────────────────────┐
            │       Behavior          │
            └────────────────────────┘
```

### Behavior Activation Curve
```
         High │
Motivation     │
                │             Behavior
                │             Happens ▲
                │                     │
                │                    ● ← Prompt occurs
                │                  ●
                │               ●
                │            ●
                │         ●
                │      ●
                │   ●
                │●
                └─────────────────────────▶
                     Low Ability       High Ability
```

---

## 4. Practical Applications in Technology

### Personal Productivity & Wellness Agents
- Motivation: Align goals with user’s intrinsic drive  
- Ability: Simplify actions (automated scheduling, micro-tasks)  
- Prompt: Contextual nudges (idle reminders, meeting prep)  

### Customer Service & Chatbots
- Motivation: Reward resolution quality  
- Ability: Access knowledge bases & APIs  
- Prompt: Trigger on customer message or sentiment detection  

### Education & Learning Systems
- Motivation: Tailored content  
- Ability: Scaffolded lessons  
- Prompt: Timed reminders or mood-based nudges  

### Health & Behavior Change Apps
- Motivation: Personalized reinforcement  
- Ability: Simplify tasks, suggest micro-actions  
- Prompt: Just-in-time interventions based on context  

### Enterprise & Industrial Automation
- Motivation: KPI alignment  
- Ability: Access data & tools  
- Prompt: Event-driven triggers  

### Generative Creativity & Co-Creation Tools
- Motivation: Align creative intent  
- Ability: Expand creative capabilities  
- Prompt: User request or pause in workflow  

---

## 5. Health / Fitness Tracking App Example

### Goal Behavior
Encourage consistent healthy actions (movement, hydration, mindfulness)

### FBM Mapping
| FBM Element | Agent Equivalent | Example |
|-------------|-----------------|---------|
| Motivation | Reward function | Maximize habit consistency |
| Ability | Tool access & simplification | Generate quick workouts, pre-log data |
| Prompt | Just-in-time trigger | Inactivity for 90 min → nudge |

### Behavior Flow Example
```
User inactive 90 min → Agent detects → Checks steps → If below goal → Sends prompt "2-min walk?" → Logs outcome → Updates reward model
```

### Features
- Adaptive prompting
- Dynamic goal shaping
- Simplified micro-actions
- Positive reinforcement
- Context-aware escalation

---

## 6. Ability Layer & Tool Discovery

### Ability = Tool Awareness + Execution Capability
- Declarative: Knows tools exist
- Procedural: Knows how to invoke tools
- Contextual: Knows when to use them

### Tool Registry Example
```json
{
  "tools": [
    { "name": "step_tracker", "inputs": ["time_window"], "outputs": ["step_count"] },
    { "name": "hydration_logger", "inputs": ["volume_ml"], "outputs": ["daily_total_ml"] },
    { "name": "notification_agent", "inputs": ["message_text"], "outputs": ["delivery_status"] }
  ]
}
```

### Dynamic Tool Discovery via MCP Servers
- MCP (Model Context Protocol) servers act as **dynamic ability interfaces**  
- Agent queries MCP → discovers available tools → updates internal ability context → executes relevant tools  

### Fitness App Example with MCP
```
User: Track steps
Agent: Queries MCP server → discovers step_tracker
Agent: Calls step_tracker.get_steps(24h)
Agent: Sends nudge via notification_agent if needed
Agent: Logs outcome and updates policy
```

### Benefits of MCP
- Dynamic tool discovery
- Contextual ability
- Standardized schemas
- Composable multi-agent ecosystems
- Security and governance
