# Public Blog API Documentation

This document describes the public-facing API endpoints for the blog system, including request parameters, response schemas, CORS settings, and a detailed guide on how to render the content blocks in the frontend.

---

## Base Configuration & CORS
* **CORS Policy**: Configured to accept requests from all origins (`*`) via the following response headers:
  * `Access-Control-Allow-Origin: *`
  * `Access-Control-Allow-Methods: GET, OPTIONS`
  * `Access-Control-Allow-Headers: Content-Type, Authorization`
* **Preflight Requests**: Automatically handles HTTP `OPTIONS` requests (returns `204 No Content`).

---

## Endpoints

### 1. List Published Blogs
Retrieve a paginated list of published blog posts. This list returns a summary of the blogs (the detailed `content` block list is excluded to minimize payload size).

* **URL**: `/blogs`
* **Method**: `GET`
* **Auth Required**: No (Public)
* **Query Parameters**:
  | Parameter | Type | Required | Description | Default |
  | :--- | :--- | :--- | :--- | :--- |
  | `limit` | `number` | No | Number of records to return (Max: `50`) | `10` |
  | `cursor` | `number` | No | Pagination offset cursor | `0` |
  | `search` | `string` | No | Case-insensitive search filter matching post `title` | None |
  | `tag` | `string` | No | Exact case-sensitive match filter on the tags array | None |
  | `lang` | `string` | No | Target language version: `id` (Indonesian) or `en` (English) | `id` |

#### Example Request
```http
GET /blogs?limit=3&cursor=0&search=react&tag=programming HTTP/1.1
Host: localhost:3000
```

#### Example Response (`200 OK`)
```json
{
  "data": [
    {
      "id": "e98e4d3a-b851-41fb-992d-45db622cde12",
      "slug": "getting-started-with-react-19",
      "title": "Getting Started with React 19 features",
      "excerpt": "A deep dive into the latest features in React 19, including Server Actions, hooks, and suspense updates.",
      "coverImage": "https://example.com/cdn/react19-cover.jpg",
      "tags": ["react", "programming", "frontend"],
      "readingTime": "6 min read",
      "content": [],
      "publishedAt": "2026-07-26T12:00:00.000Z",
      "updatedAt": "2026-07-26T12:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 3,
    "nextCursor": "3",
    "hasMore": true
  }
}
```

---

### 2. Get Blog Post Detail
Retrieve full details of a specific published blog post by its unique URL slug. This returns the complete `content` array containing all rich text blocks.

* **URL**: `/blogs/[slug]`
* **Method**: `GET`
* **Auth Required**: No (Public)
* **Path Parameters**:
  * `slug` (string, required): The URL slug of the blog post.
* **Query Parameters**:
  * `lang` (string, optional): Target language version: `id` (Indonesian) or `en` (English) (default `id`). Resolves the translated title, excerpt, and content.

#### Example Request
```http
GET /blogs/getting-started-with-react-19 HTTP/1.1
Host: localhost:3000
```

#### Example Response (`200 OK`)
```json
{
  "id": "e98e4d3a-b851-41fb-992d-45db622cde12",
  "slug": "getting-started-with-react-19",
  "title": "Getting Started with React 19 features",
  "excerpt": "A deep dive into the latest features in React 19, including Server Actions, hooks, and suspense updates.",
  "coverImage": "https://example.com/cdn/react19-cover.jpg",
  "tags": ["react", "programming", "frontend"],
  "readingTime": "6 min read",
  "publishedAt": "2026-07-26T12:00:00.000Z",
  "updatedAt": "2026-07-26T12:00:00.000Z",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "text": "React 19 is Here!"
    },
    {
      "type": "paragraph",
      "text": "React 19 introduces amazing capabilities like Server Actions and native form features. Check out https://react.dev for official docs."
    }
  ]
}
```

---

## Content Block Schema (How to Render the Post Body)

The `content` field returned in the **Blog Post Detail** endpoint is an array of content block objects. The frontend client (FE) should loop through the blocks and render a React/Vue/HTML component matching the block's `type`.

### 🔗 Inline Links in Text
All text fields inside `paragraph`, `heading`, `quote`, `list` (items), and `callout` blocks can contain:
1. **Raw URLs** (e.g. `https://google.com` or `http://bing.com`).
2. **Markdown Links** (e.g. `[Google Search](https://google.com)`).

> [!TIP]
> **FE Implementation Guideline**: Use a parser function (e.g., regex-based splitter) to automatically convert plain links and markdown links inside these text fields into blue clickable HTML anchor elements (`<a href="..." class="text-sky-400 hover:underline">...</a>`).

---

### Supported Block Types

#### 1. Paragraph (`type: "paragraph"`)
Basic text blocks.
* **Schema**:
  ```typescript
  { type: "paragraph"; text: string }
  ```
* **Example**:
  ```json
  {
    "type": "paragraph",
    "text": "React 19 is a major upgrade. Learn more at https://react.dev or read our [tutorial](https://example.com/tutorial)."
  }
  ```

#### 2. Heading (`type: "heading"`)
Section headers.
* **Schema**:
  ```typescript
  { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  ```
* **Example**:
  ```json
  {
    "type": "heading",
    "level": 2,
    "text": "1. Server Actions Explained"
  }
  ```

#### 3. Single Image (`type: "image"`)
Displays a full-width image with an optional caption.
* **Schema**:
  ```typescript
  { type: "image"; src: string; alt: string; caption?: string }
  ```
* **Example**:
  ```json
  {
    "type": "image",
    "src": "https://supabase.co/images/blog/react19.jpg",
    "alt": "React 19 banner illustration",
    "caption": "Figure 1: React 19 architecture overview"
  }
  ```

#### 4. Image Gallery (`type: "gallery"`)
Displays two or more images side-by-side (rendered on the FE as a responsive CSS grid, e.g. `grid grid-cols-1 md:grid-cols-2 gap-4`).
* **Schema**:
  ```typescript
  { type: "gallery"; items: Array<{ src: string; alt: string }> }
  ```
* **Example**:
  ```json
  {
    "type": "gallery",
    "items": [
      { "src": "https://example.com/pic1.jpg", "alt": "Wireframe mockup" },
      { "src": "https://example.com/pic2.jpg", "alt": "Finished design UI" }
    ]
  }
  ```

#### 5. Quote (`type: "quote"`)
Displays a blockquote element (render with a left border highlight, e.g., `border-l-4 border-sky-400 pl-4 italic`).
* **Schema**:
  ```typescript
  { type: "quote"; text: string }
  ```
* **Example**:
  ```json
  {
    "type": "quote",
    "text": "React 19 makes development faster, cleaner, and more standard-compliant."
  }
  ```

#### 6. Code Snippet (`type: "code"`)
Displays syntax-highlighted code block.
* **Schema**:
  ```typescript
  { type: "code"; code: string }
  ```
* **Example**:
  ```json
  {
    "type": "code",
    "code": "const [state, formAction] = useActionState(loginHandler, null);"
  }
  ```

#### 7. Bulleted/Numbered List (`type: "list"`)
Represents an ordered or unordered list of items.
* **Schema**:
  ```typescript
  { type: "list"; style: "ordered" | "unordered"; items: string[] }
  ```
* **Example**:
  ```json
  {
    "type": "list",
    "style": "unordered",
    "items": [
      "Use Server Actions for form handling",
      "Leverage the new 'use' hook for resource loading",
      "Read about updates at https://react.dev/blog"
    ]
  }
  ```

#### 8. Callout Box (`type: "callout"`)
Displays an highlighted info/warning alert card.
* **Schema**:
  ```typescript
  { type: "callout"; title: string; text: string }
  ```
* **Example**:
  ```json
  {
    "type": "callout",
    "title": "Pro Tip",
    "text": "React 19 automatically loads scripts async! No need for custom loaders."
  }
  ```
