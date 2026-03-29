---
name: "frontend-natural"
description: "Writes natural, human-like frontend code without AI-style patterns. Invoke when user asks for frontend code, UI components, or mentions 'AI味' or 'natural code'."
---

# Natural Frontend Code Skill

This skill helps you write frontend code that feels natural and human-written, avoiding common AI-generated code patterns.

## What is "AI味" Code?

AI-generated code often has these characteristics:
- Overly verbose comments explaining obvious things
- Excessive use of `const` for everything
- Over-engineered abstractions
- Generic placeholder names like `data`, `item`, `value`
- Excessive TypeScript generics
- Unnecessary async/await wrappers
- Overly defensive null checks
- Cookie-cutter component structure

## Guidelines for Natural Frontend Code

### 1. Comments
```javascript
// Bad (AI style)
// This function handles the click event for the submit button
const handleSubmit = () => { ... }

// Good (Natural)
const handleSubmit = () => { ... }
```

Only comment complex logic, workarounds, or non-obvious decisions.

### 2. Variable Naming
```javascript
// Bad (AI style)
const userList = users.filter(user => user.isActive)
const filteredData = userList.map(item => item.name)

// Good (Natural)
const activeUsers = users.filter(user => user.isActive)
const names = activeUsers.map(user => user.name)
```

Use specific, meaningful names based on context.

### 3. Component Structure
```javascript
// Bad (AI style) - Over-engineered
const UserCard = ({ user, onClick, variant, size, disabled }) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick?.(user)
    }
  }, [user, onClick, disabled])

  const className = useMemo(() => {
    return clsx(styles.card, styles[variant], styles[size], {
      [styles.disabled]: disabled
    })
  }, [variant, size, disabled])

  return <div className={className} onClick={handleClick}>...</div>
}

// Good (Natural) - Simple and direct
function UserCard({ user, onClick }) {
  return (
    <div className={styles.card} onClick={() => onClick?.(user)}>
      <span>{user.name}</span>
    </div>
  )
}
```

### 4. TypeScript
```typescript
// Bad (AI style) - Over-typed
interface UserCardProps<T extends User> {
  user: T
  onClick: (user: T) => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

// Good (Natural) - Practical typing
type UserCardProps = {
  user: User
  onClick: (user: User) => void
}
```

### 5. Async Code
```javascript
// Bad (AI style) - Unnecessary async wrapper
const fetchData = async () => {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}

// Good (Natural) - Direct and simple
const fetchData = () => fetch(url).then(r => r.json())
```

### 6. State Management
```javascript
// Bad (AI style) - Over-engineered
const [state, dispatch] = useReducer(reducer, initialState)

// Good (Natural) - Use what's needed
const [isOpen, setIsOpen] = useState(false)
```

### 7. CSS/Styling
```css
/* Bad (AI style) - Over-commented */
/* Container for the user card component */
.user-card-container {
  /* Padding for spacing */
  padding: 16px;
  /* Border radius for rounded corners */
  border-radius: 8px;
}

/* Good (Natural) */
.user-card {
  padding: 16px;
  border-radius: 8px;
}
```

## Key Principles

1. **Less is more** - Don't add abstractions until needed
2. **Be pragmatic** - Use the simplest solution that works
3. **Write for humans** - Code should read naturally
4. **Avoid defensive over-engineering** - Trust the data flow
5. **Use framework conventions** - Don't fight the framework
6. **Keep components small** - But not artificially split
7. **Real examples over generic ones** - Use actual use cases

## When Writing Code

- Start with the simplest implementation
- Add complexity only when requirements demand it
- Use meaningful names from the domain
- Skip obvious comments
- Prefer framework built-ins over custom abstractions
- Write code you'd actually write in a real project

## React/Vue Specific

### React
- Use function components
- Avoid premature `useMemo`/`useCallback`
- Keep props minimal
- Use destructuring naturally

### Vue
- Use Composition API when it makes sense
- Keep Options API for simple components
- Don't over-abstract composables
- Use meaningful ref/reactive names
