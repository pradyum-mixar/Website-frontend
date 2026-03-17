import { useEffect, useState } from "react";
import { PublicNavbar } from "../components/PublicNavbar";
import "../assets/css/landing.css";
import "../assets/css/docs.css";

type TocItem = { id: string; label: string; children?: { id: string; label: string }[] };

const TOC: TocItem[] = [
  {
    id: "chat",
    label: "Chat",
    children: [
      { id: "ask-mode", label: "Ask Mode" },
      { id: "agent-mode", label: "Agent Mode" },
      { id: "plan-mode", label: "Plan Mode" },
      { id: "generate-mode", label: "Generate Mode" },
    ],
  },
  {
    id: "moodboard",
    label: "Moodboard",
    children: [
      { id: "moodboard-basics", label: "Getting Started" },
      { id: "image-generation", label: "Image Generation" },
      { id: "blockout-to-render", label: "Blockout to Render" },
      { id: "pbr-map-generation", label: "PBR Map Generation" },
      { id: "image-to-3d", label: "Image to 3D" },
      { id: "segment-to-3d", label: "Segment to 3D" },
      { id: "generate-scene", label: "Generate Scene" },
      { id: "retopology", label: "Retopology" },
    ],
  },
  {
    id: "layer-painting",
    label: "Layer Painting",
    children: [
      { id: "pbr-channels", label: "PBR Channels" },
      { id: "layer-types", label: "Layer Types" },
      { id: "masks", label: "Masks" },
      { id: "painting", label: "Painting" },
      { id: "mesh-baking", label: "Mesh Baking" },
      { id: "baking-and-export", label: "Baking & Export" },
    ],
  },
  {
    id: "workflows",
    label: "Workflows",
  },
  {
    id: "shortcuts",
    label: "Keyboard Shortcuts",
  },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function DocsPage() {
  const [activeId, setActiveId] = useState("");

  // Fix sticky sidebar: override overflow-x:hidden on html/body which implicitly
  // sets overflow-y:auto and breaks position:sticky. clip does the same visual
  // clipping without creating a scroll container.
  useEffect(() => {
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflowX = "clip";
    return () => {
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
    };
  }, []);

  // Track which section is in view via scroll position
  useEffect(() => {
    const ids = TOC.flatMap((s) => [s.id, ...(s.children?.map((c) => c.id) ?? [])]);

    const handleScroll = () => {
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) {
          current = id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="docs-page">
      <PublicNavbar />

      <div className="docs-layout">
        {/* ── Sidebar ── */}
        <aside className="docs-sidebar-cell">
          <nav className="docs-sidebar">
            <p className="docs-toc-title">Documentation</p>
            {TOC.map((section) => (
              <div key={section.id} className="docs-toc-section">
                <button
                  className={`docs-toc-section-title${
                    activeId === section.id || section.children?.some((c) => c.id === activeId)
                      ? " active"
                      : ""
                  }`}
                  onClick={() => scrollTo(section.id)}
                >
                  {section.label}
                </button>
                {section.children?.map((child) => (
                  <button
                    key={child.id}
                    className={`docs-toc-link${activeId === child.id ? " active" : ""}`}
                    onClick={() => scrollTo(child.id)}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="docs-content">
          {/* Header */}
          <div className="docs-header">
            <p className="docs-header-label">Feature Guide</p>
            <h1>
              Learn <span className="docs-text-gradient">Mixar</span>
            </h1>
            <p className="docs-header-description">
              Everything you need to know about Mixar's AI-powered 3D creation tools — from generating
              images and 3D models to layer-based texturing and conversational scene building. Have a
              question? Just ask Mixar directly in <strong>Ask Mode</strong> — it knows the entire
              documentation and can answer anything about the app.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/*  CHAT                                                                */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <section id="chat" className="docs-section">
            <h2 className="docs-section-title">Chat</h2>
            <p className="docs-section-intro">
              The Chat interface is your conversational bridge to everything Mixar can do. Instead of
              hunting through menus and panels, describe what you want in plain language and Mixar
              handles the execution.
            </p>

            {/* Ask Mode */}
            <div id="ask-mode" className="docs-feature">
              <h3 className="docs-feature-title">Ask Mode</h3>
              <p>
                A conversational Q&A mode for getting help, learning features, and understanding
                workflows — without executing any actions in your scene.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/ask.png"
                alt="Ask Mode interface"
                className="docs-feature-image"
              />
              <p>
                Ask Mode is your knowledge base. It searches Mixar's documentation and responds with
                relevant information, tips, and guidance. Nothing in your scene changes — it's purely
                informational.
              </p>

              <p className="docs-subheading">What you can ask</p>
              <ul className="docs-list">
                <li>
                  <strong>Feature questions</strong> — "How does UV packing work?" "What's the
                  difference between Angle Based and Conformal unwrapping?"
                </li>
                <li>
                  <strong>Workflow guidance</strong> — "What's the best way to texture a character
                  model?"
                </li>
                <li>
                  <strong>Tool explanations</strong> — "What does the Texel Density tool do?"
                </li>
                <li>
                  <strong>Best practices</strong> — "What texel density should I use for a game
                  asset?"
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">Good to know</p>
                <ul className="docs-list">
                  <li>
                    If you ask Mixar to perform an action in Ask Mode — like "create a cube" — it'll
                    let you know that you need to switch to Agent Mode. Ask Mode is read-only by
                    design.
                  </li>
                </ul>
              </div>
            </div>

            {/* Agent Mode */}
            <div id="agent-mode" className="docs-feature">
              <h3 className="docs-feature-title">Agent Mode</h3>
              <p>
                The execution mode. Tell Mixar what you want done, and it carries out the operations
                directly in your Blender scene.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/agent.png"
                alt="Agent Mode interface"
                className="docs-feature-image"
              />
              <p>
                Agent Mode has access to a full suite of 3D tools — modeling, UV editing, texturing,
                scene setup, material creation, and more. You describe the task in natural language,
                and Mixar translates that into actual Blender operations.
              </p>

              <p className="docs-subheading">What it can do</p>
              <ul className="docs-list">
                <li>
                  <strong>Modeling</strong> — "Create a low-poly tree", "Bevel the edges of the
                  selected object"
                </li>
                <li>
                  <strong>UV editing</strong> — "Unwrap the selected mesh using Smart UV Project"
                </li>
                <li>
                  <strong>Texturing</strong> — "Apply a brushed metal material to the selected object"
                </li>
                <li>
                  <strong>Scene setup</strong> — "Add a three-point lighting setup", "Position the
                  camera for a hero shot"
                </li>
                <li>
                  <strong>Multi-step tasks</strong> — "Model a simple table, unwrap it, and apply a
                  wood material"
                </li>
              </ul>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Type your request in the chat</li>
                <li>
                  Mixar interprets your intent and determines which tools and operations to use
                </li>
                <li>Operations execute directly in your Blender scene</li>
                <li>You see the results immediately in the viewport</li>
                <li>
                  Continue the conversation to refine — "make it taller", "try a different approach"
                </li>
              </ol>

              <p>
                Agent Mode automatically switches between specialized tool sets (modeling, UV, texturing,
                scene, etc.) based on what you're working on.
              </p>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>
                    Be specific. "Make it look better" is hard to act on. "Increase the subdivision
                    level to 3 and smooth the normals" gets exactly what you need.
                  </li>
                  <li>
                    Agent Mode remembers context within your conversation. "Now do the same thing to
                    the other object" will work.
                  </li>
                  <li>
                    If something doesn't look right, just say so — "That's too many polygons,
                    simplify it."
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan Mode */}
            <div id="plan-mode" className="docs-feature">
              <h3 className="docs-feature-title">Plan Mode</h3>
              <p>
                For complex, multi-step tasks, Plan Mode lets you review and approve the execution
                plan before anything happens.
              </p>
              <p>
                When you enable Plan Mode within Agent, Mixar doesn't immediately start working.
                Instead, it analyzes your request, breaks it down into a step-by-step plan, and
                presents it for your approval. Nothing executes until you say go.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Enable Plan Mode when submitting your request</li>
                <li>
                  Describe your task — for example: "Set up a product shot: create a circular
                  pedestal, place the selected object on it, add a seamless backdrop, set up studio
                  lighting with soft shadows, and position the camera for a 3/4 angle hero shot"
                </li>
                <li>
                  Mixar analyzes the task and generates a detailed execution plan with each operation
                  listed in order
                </li>
                <li>
                  <strong>Approve</strong> to execute the full plan, or{" "}
                  <strong>provide feedback</strong> to adjust it before execution
                </li>
                <li>Mixar executes the approved plan step by step</li>
              </ol>

              <p className="docs-subheading">When to use it</p>
              <ul className="docs-list">
                <li>
                  <strong>Complex multi-step workflows</strong> — Tasks where getting the order wrong
                  would be costly
                </li>
                <li>
                  <strong>Learning and transparency</strong> — When you want to understand exactly
                  what Mixar will do
                </li>
                <li>
                  <strong>Critical work</strong> — When you want to validate the approach before any
                  changes are made
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">When to skip it</p>
                <ul className="docs-list">
                  <li>
                    For simple, quick operations — "add a cube", "delete the selected object" — Plan
                    Mode adds unnecessary overhead. Just use regular Agent Mode.
                  </li>
                </ul>
              </div>
            </div>

            {/* Generate Mode */}
            <div id="generate-mode" className="docs-feature">
              <h3 className="docs-feature-title">Generate Mode</h3>
              <p>
                A specialized mode within Agent that gives you direct access to all of Mixar's AI
                generation capabilities through chat.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/generate.png"
                alt="Generate Mode interface"
                className="docs-feature-image"
              />
              <p>
                Generate Mode bundles all the Moodboard's AI functions into the conversational
                interface. Instead of selecting functions from the Moodboard UI, you describe what you
                want to generate in natural language.
              </p>

              <p className="docs-subheading">Available generation tools</p>
              <ul className="docs-list">
                <li>
                  <strong>Image Generation</strong> — "Generate a concept image of a medieval
                  blacksmith's forge"
                </li>
                <li>
                  <strong>Blockout to Render</strong> — "Render this blockout as a cyberpunk alley at
                  night"
                </li>
                <li>
                  <strong>PBR Map Generation</strong> — "Generate PBR textures for the selected mesh
                  — aged bronze with verdigris"
                </li>
                <li>
                  <strong>Image to 3D</strong> — "Convert the selected moodboard image to a 3D model"
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>
                    You can chain generations in conversation: "Generate a concept image of a crystal
                    goblet" → "Now convert that to 3D" → "Generate PBR maps for it — frosted glass
                    with gold trim"
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="docs-divider" />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/*  MOODBOARD                                                           */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <section id="moodboard" className="docs-section">
            <h2 className="docs-section-title">Moodboard</h2>
            <p className="docs-section-intro">
              The Moodboard is your starting point for AI-powered content creation. Import reference
              images, generate new ones, convert 2D concepts into 3D models, create PBR textures, and
              build entire scenes — all through a visual, image-centric workflow.
            </p>

            {/* Getting Started */}
            <div id="moodboard-basics" className="docs-feature">
              <h3 className="docs-feature-title">Getting Started</h3>
              <p>
                The Moodboard is a 2D canvas where you collect and arrange reference images, kick off
                AI generation workflows, and receive generated results. Everything starts here.
              </p>

              <p className="docs-subheading">Adding Images</p>
              <ul className="docs-list">
                <li>
                  <strong>Open Image</strong> — Click the folder icon in the left toolbar to browse
                  for files. Supported formats: .png, .jpg, .bmp, .tga, .tiff, .webp
                </li>
                <li>
                  <strong>Drag & Drop</strong> — Drag one or more image files directly onto the
                  moodboard canvas
                </li>
                <li>
                  <strong>Add Existing Image</strong> — Add an image already loaded in Blender via
                  the same folder icon's popover menu
                </li>
              </ul>

              <p className="docs-subheading">Selecting Images</p>
              <ul className="docs-list">
                <li><strong>Click</strong> — Select a single image. Click empty canvas to deselect.</li>
                <li><strong>Shift+Click</strong> — Add to selection</li>
                <li>
                  <strong>Box Select</strong> — Click and drag on empty canvas to select multiple
                  images by region
                </li>
                <li><strong>A</strong> — Select All / Deselect All</li>
              </ul>

              <p className="docs-subheading">Transforming Images</p>
              <ul className="docs-list">
                <li><strong>G</strong> — Grab and move selected images interactively</li>
                <li><strong>R</strong> — Rotate freely</li>
                <li><strong>S</strong> — Scale</li>
                <li>
                  Confirm a transform with <strong>Left-click</strong> or <strong>Enter</strong>;
                  cancel with <strong>Right-click</strong> or <strong>Esc</strong>
                </li>
                <li>
                  Right-click for <strong>Rotate 90°</strong>, <strong>Flip Horizontal</strong>,{" "}
                  <strong>Flip Vertical</strong>, and <strong>Duplicate</strong>
                </li>
              </ul>

              <p className="docs-subheading">Toolbar</p>
              <ul className="docs-list">
                <li>
                  <strong>Add Image</strong> (folder icon) — Open images from disk or add existing
                  Blender images
                </li>
                <li>
                  <strong>Mask Tools</strong> — Reveals <strong>Box Mask</strong> and{" "}
                  <strong>Magic Select</strong> for AI-powered object segmentation. Used by Segment
                  to 3D workflows. Only active when an image is selected.
                </li>
                <li>
                  <strong>Add Text</strong> — Place an annotation label anywhere on the canvas
                </li>
                <li>
                  <strong>Rotate 90°</strong> — Instantly rotate selected images clockwise
                </li>
                <li>
                  <strong>Send to Chat</strong> — Transfer selected images to the Chat panel as
                  attachments. Shortcut: <strong>Cmd+P</strong> (Mac) /{" "}
                  <strong>Ctrl+P</strong> (Windows/Linux)
                </li>
              </ul>

              <p className="docs-subheading">Send to Chat</p>
              <p>
                Select one or more moodboard images and press <strong>Cmd+P</strong> (Mac) or{" "}
                <strong>Ctrl+P</strong> (Windows/Linux) to attach them to the Chat input. This is
                how you reference specific moodboard images in an Agent Mode or Generate Mode
                conversation — for example, "convert this image to 3D" while the image is attached.
              </p>

              <p className="docs-subheading">Groups</p>
              <p>
                Select two or more images, then right-click → <strong>Group</strong> to link them
                together. Grouped images move and transform as a unit, and sending any image from a
                group to Chat automatically includes all other group members.
              </p>

              <p className="docs-subheading">Exporting Images</p>
              <p>
                Right-click a selected image → <strong>Export Images</strong> to save it to disk as
                a .png file. You can export multiple selected images at once.
              </p>

              <p className="docs-subheading">Quick-Access Pie Menu</p>
              <p>
                Press <strong>Tab</strong> or <strong>`</strong> (backtick) anywhere on the moodboard
                to open a radial pie menu with direct shortcuts to all AI generation features —
                Image Generation, PBR Maps, Image to 3D, Segment to 3D, Generate Scene, and more.
              </p>
            </div>

            {/* Image Generation */}
            <div id="image-generation" className="docs-feature">
              <h3 className="docs-feature-title">Image Generation</h3>
              <p>
                Turn text descriptions into images, or create variations from existing references.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/generate-image.png"
                alt="Image Generation interface"
                className="docs-feature-image"
              />

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Open the Moodboard panel in AI Mode</li>
                <li>
                  Select <strong>Image Generation</strong> from the AI function menu
                </li>
                <li>
                  Type a prompt describing what you want — for example:{" "}
                  <em>
                    "weathered sci-fi cargo crate, metallic surface with dents and rust patches,
                    studio lighting"
                  </em>
                </li>
                <li>
                  Optionally select reference images from your moodboard to guide the style,
                  composition, or subject
                </li>
                <li>
                  Choose your quality tier:
                  <ul className="docs-list" style={{ marginTop: 8 }}>
                    <li>
                      <strong>Fast</strong> — Good for quick iterations and concept exploration
                    </li>
                    <li>
                      <strong>Pro</strong> — Higher quality output with more control over resolution
                      and aspect ratio. Supports up to 4K, wider aspect ratios, and up to 14
                      reference images
                    </li>
                  </ul>
                </li>
                <li>
                  Generated images appear in your moodboard, ready to use as references, textures, or
                  input for other AI functions
                </li>
              </ol>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>
                    Use specific, descriptive prompts. Instead of "a sword," try "a fantasy longsword
                    with ornate gold crossguard, dark leather grip, glowing blue runes on the blade."
                  </li>
                  <li>
                    Feed in reference images alongside your prompt to get closer to a specific style
                  </li>
                  <li>
                    Generate multiple variations and pick the best one — iteration is fast and cheap
                  </li>
                  <li>
                    Generated images can immediately be used as input for Image to 3D, PBR Map
                    Generation, or any other moodboard function
                  </li>
                </ul>
              </div>
            </div>

            {/* Blockout to Render */}
            <div id="blockout-to-render" className="docs-feature">
              <h3 className="docs-feature-title">Blockout to Render</h3>
              <p>
                Turn rough 3D blockouts into polished concept renders without spending hours on
                materials, lighting, and rendering.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/blockout-to-render.png"
                alt="Blockout to Render interface"
                className="docs-feature-image"
              />
              <p>
                This feature bridges the gap between the "gray box" phase of 3D work and a
                finished-looking image. If you've ever built a quick composition out of primitives and
                wished you could instantly see what it would look like fully rendered — this is exactly
                that.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>
                  Build a rough scene in the 3D viewport using basic shapes — cubes, cylinders,
                  spheres, or any geometry. This is your blockout.
                </li>
                <li>Position your camera to frame the composition you want</li>
                <li>
                  Select <strong>Blockout to Render</strong> from the moodboard
                </li>
                <li>
                  Write a prompt describing the visual style — for example:{" "}
                  <em>
                    "ancient stone temple interior, overgrown with vines, volumetric light shafts
                    through broken ceiling"
                  </em>
                </li>
                <li>
                  Mixar captures a depth image of your viewport (preserving 3D structure and spatial
                  relationships) and uses it as a structural guide for AI image generation
                </li>
                <li>
                  The result is an image that respects the geometry and composition of your blockout
                  while applying the style, materials, lighting, and atmosphere from your prompt
                </li>
              </ol>

              <p className="docs-subheading">When to use it</p>
              <ul className="docs-list">
                <li>
                  <strong>Early concept exploration</strong> — Block out a scene in minutes, then
                  generate multiple style variations before committing to detailed modeling
                </li>
                <li>
                  <strong>Client presentations</strong> — Turn a rough layout into a convincing visual
                  without a full production pipeline
                </li>
                <li>
                  <strong>Composition testing</strong> — Quickly validate camera angles and spatial
                  arrangements
                </li>
                <li>
                  <strong>Art direction</strong> — Generate style targets for your team based on
                  actual 3D layouts
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>
                    The quality of your blockout matters. Even simple geometry communicates scale,
                    depth, and spatial relationships that the AI will preserve.
                  </li>
                  <li>
                    Try the same blockout with different prompts to explore wildly different styles
                    from one layout
                  </li>
                  <li>
                    Use the generated images as painting references or texture projections later in
                    your pipeline
                  </li>
                </ul>
              </div>
            </div>

            {/* PBR Map Generation */}
            <div id="pbr-map-generation" className="docs-feature">
              <h3 className="docs-feature-title">PBR Map Generation</h3>
              <p>
                Generate a complete set of PBR texture maps for any mesh directly from a reference
                image or text description.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/generate-pbr-maps.png"
                alt="PBR Map Generation interface"
                className="docs-feature-image"
              />
              <p>
                Instead of manually authoring every map in a texturing application, PBR Map Generation
                analyzes your input and produces a full material — Base Color, Roughness, Metallic, and
                Normal maps — applied directly to your object.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>
                  Select the mesh you want to texture (it must have UV coordinates — unwrap first if
                  needed)
                </li>
                <li>
                  Select <strong>PBR Map Generation</strong> from the moodboard
                </li>
                <li>
                  Provide a material description or select a reference image — for example:{" "}
                  <em>"hammered copper with green patina, aged"</em>
                </li>
                <li>
                  Mixar generates four PBR maps: <strong>Base Color</strong>,{" "}
                  <strong>Roughness</strong>, <strong>Metallic</strong>, and <strong>Normal</strong>
                </li>
                <li>
                  The maps are automatically connected to a material and applied to your selected
                  objects
                </li>
              </ol>

              <p className="docs-subheading">When to use it</p>
              <ul className="docs-list">
                <li>
                  <strong>Rapid prototyping</strong> — Get a textured look on your model in seconds
                </li>
                <li>
                  <strong>Material exploration</strong> — Try different materials on the same mesh
                  quickly
                </li>
                <li>
                  <strong>Base layer for manual texturing</strong> — Use AI-generated maps as a
                  starting point, then refine in Layer Painting
                </li>
                <li>
                  <strong>Game-ready textures</strong> — Output maps are standard PBR and compatible
                  with any modern renderer or game engine
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>
                    Make sure your mesh has clean UVs before generating. Poor UV layout will result in
                    poor texture quality.
                  </li>
                  <li>
                    Be specific with your material prompts. "Metal" is vague — "brushed stainless
                    steel with fingerprint smudges" gives much better results.
                  </li>
                  <li>
                    You can generate PBR maps from photos too. Upload a close-up photo of a real
                    material, and Mixar will extract all four PBR channels from it.
                  </li>
                </ul>
              </div>
            </div>

            {/* Image to 3D */}
            <div id="image-to-3d" className="docs-feature">
              <h3 className="docs-feature-title">Image to 3D</h3>
              <p>
                Convert a 2D image into a full 3D model, complete with geometry and textures.
              </p>
              <div className="docs-feature-image-grid">
                <figure>
                  <img
                    src="https://d2znch1yzypu23.cloudfront.net/docs/image-to-3d-basic.png"
                    alt="Image to 3D — Basic tier"
                  />
                  <figcaption>Basic</figcaption>
                </figure>
                <figure>
                  <img
                    src="https://d2znch1yzypu23.cloudfront.net/docs/image-to-3d-pro.png"
                    alt="Image to 3D — Pro tier"
                  />
                  <figcaption>Pro</figcaption>
                </figure>
              </div>
              <p>
                Take any concept art, photo, or AI-generated image and turn it into a 3D mesh you can
                immediately work with — edit the topology, adjust the form, apply new materials, or
                drop it into a scene.
              </p>

              <p className="docs-subheading">Tiers</p>
              <ul className="docs-list">
                <li>
                  <strong>Basic</strong> — Text prompt (optional) plus an input image. Best for
                  quick, straightforward conversions
                </li>
                <li>
                  <strong>Pro</strong> — Advanced output with multi-view support (up to 8 reference
                  views), face count control (40k–1.5M polygons), PBR texture output, and model
                  version selection. Use this when accuracy and quality matter most
                </li>
              </ul>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>
                  Add your source image to the moodboard (drag and drop or import from disk)
                </li>
                <li>
                  Select the image and choose <strong>Image to 3D</strong> from the AI function menu
                </li>
                <li>Pick a tier — Basic, or Pro</li>
                <li>
                  Configure output settings — AI model, and for Pro: face count and polygon type
                </li>
                <li>
                  Start the generation. Basic gives you different AI models to choose from; Pro takes the longest but produces
                  the highest quality result
                </li>
                <li>
                  Once complete, the 3D model is automatically imported into your Blender scene
                </li>
              </ol>

              <p className="docs-subheading">What to expect</p>
              <p>
                Output quality depends heavily on the input image. Clean, well-lit images with a
                clear subject on a simple background produce the best results. Generated models are a
                strong starting point but often benefit from cleanup — use Retopology for cleaner
                topology, and Layer Painting to refine textures.
              </p>

              <div className="docs-tip">
                <p className="docs-tip-title">Tips</p>
                <ul className="docs-list">
                  <li>Single-subject images with a clean background work best</li>
                  <li>
                    For Pro mode, supplying multiple views of the same object (front, side, back)
                    dramatically improves accuracy
                  </li>
                  <li>
                    Chain with Image Generation: generate a concept image, then immediately convert
                    it to 3D
                  </li>
                </ul>
              </div>
            </div>

            {/* Segment to 3D */}
            <div id="segment-to-3d" className="docs-feature">
              <h3 className="docs-feature-title">Segment to 3D</h3>
              <p>
                Isolate specific objects from an image and convert each one into an individual 3D
                model, assembled into a scene.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/segment-to-3d.png"
                alt="Segment to 3D interface"
                className="docs-feature-image"
              />
              <p>
                Unlike Image to 3D which converts the entire image into a single mesh, Segment to 3D
                lets you pick and choose — select the objects you care about, and Mixar will extract
                each one separately, generate individual 3D models, and place them in your scene with
                correct spatial relationships.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Add your source image to the moodboard and select it</li>
                <li>
                  Open the <strong>Segment to 3D</strong> panel from the AI function menu or sidebar
                </li>
                <li>
                  Use the <strong>Mask Tools</strong> in the toolbar to identify objects:
                  <ul className="docs-list" style={{ marginTop: 8 }}>
                    <li>
                      <strong>Box Mask</strong> — Draw a rectangle around an object. Mixar's AI
                      (SAM) automatically refines the box into a precise object mask
                    </li>
                    <li>
                      <strong>Magic Select</strong> — Click directly on any object in the image.
                      SAM instantly segments it into a clean mask
                    </li>
                  </ul>
                </li>
                <li>
                  Each selection creates a segment — toggle segments active or inactive in the
                  sidebar list to choose which objects to convert
                </li>
                <li>Click <strong>Generate</strong> — each active segment is converted to a 3D model</li>
                <li>
                  All generated models are placed in a scene, preserving their spatial relationships
                  from the original image
                </li>
              </ol>

              <p className="docs-subheading">When to use it</p>
              <ul className="docs-list">
                <li>
                  <strong>Scene reconstruction from reference photos</strong> — Extract individual
                  furniture, props, or architectural elements as separate 3D objects
                </li>
                <li>
                  <strong>Selective extraction</strong> — You only need the chair from the reference,
                  not the entire room
                </li>
                <li>
                  <strong>Modular scene building</strong> — Objects become independent meshes you can
                  rearrange, rescale, or replace
                </li>
              </ul>
            </div>

            {/* Generate Scene */}
            <div id="generate-scene" className="docs-feature">
              <h3 className="docs-feature-title">Generate Scene</h3>
              <p>
                Convert an entire image into a full 3D scene with multiple objects, all at once.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/generate-scene.png"
                alt="Generate Scene interface"
                className="docs-feature-image"
              />
              <p>
                While Segment to 3D lets you handpick which objects to extract, Generate Scene
                automates the entire process. Mixar analyzes the image, identifies all the objects,
                segments them automatically, generates 3D models for each one, and assembles them into
                a complete scene.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Add your source image to the moodboard</li>
                <li>
                  Select <strong>Generate Scene</strong> from the AI function menu
                </li>
                <li>
                  Mixar automatically analyzes the image to understand what objects are present,
                  segments each one, generates a 3D model for every identified object, and places all
                  models in a scene matching the original image
                </li>
                <li>The complete scene appears in your 3D viewport, ready to work with</li>
              </ol>

              <p className="docs-subheading">How it compares to Image to 3D</p>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Image to 3D</th>
                      <th>Generate Scene</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Output</td>
                      <td>One mesh</td>
                      <td>Multiple meshes arranged in a scene</td>
                    </tr>
                    <tr>
                      <td>Object detection</td>
                      <td>None (entire image as one subject)</td>
                      <td>Automatic (identifies all objects)</td>
                    </tr>
                    <tr>
                      <td>Spatial layout</td>
                      <td>Single object, no scene context</td>
                      <td>Full scene with object placement</td>
                    </tr>
                    <tr>
                      <td>Best for</td>
                      <td>Individual assets</td>
                      <td>Environment and scene creation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Retopology */}
            <div id="retopology" className="docs-feature">
              <h3 className="docs-feature-title">Retopology</h3>
              <p>
                Simplify high-poly meshes into clean, lower-poly versions while preserving the visual
                shape.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/retopology.png"
                alt="Retopology interface"
                className="docs-feature-image"
              />
              <p>
                Whether you're working with a scan, a sculpt, or an AI-generated mesh with messy
                topology, Retopology takes your high-poly input and produces a cleaner, more efficient
                version. This is essential for getting meshes ready for animation, game engines, or any
                context where polygon count matters.
              </p>

              <p className="docs-subheading">How it works</p>
              <ol className="docs-steps">
                <li>Select the high-poly mesh you want to retopologize</li>
                <li>
                  Choose <strong>Retopology</strong> from the moodboard
                </li>
                <li>
                  Mixar processes the mesh and generates a simplified version that reduces polygon
                  count, preserves the overall shape and silhouette, and produces cleaner edge flow
                </li>
                <li>The retopologized mesh is added to your scene</li>
              </ol>

              <p className="docs-subheading">When to use it</p>
              <ul className="docs-list">
                <li>
                  <strong>After Image to 3D or Generate Scene</strong> — AI-generated meshes often
                  have dense, irregular topology. Retopology cleans them up for production use.
                </li>
                <li>
                  <strong>Sculpt cleanup</strong> — Take a high-poly sculpt and get a usable base
                  mesh
                </li>
                <li>
                  <strong>Performance optimization</strong> — Reduce polygon counts for game assets,
                  AR/VR, or real-time applications
                </li>
                <li>
                  <strong>Animation preparation</strong> — Clean topology is essential for
                  deformation and rigging
                </li>
              </ul>
            </div>
          </section>

          <hr className="docs-divider" />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/*  LAYER PAINTING                                                      */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <section id="layer-painting" className="docs-section">
            <h2 className="docs-section-title">Layer Painting</h2>
            <p className="docs-section-intro">
              Mixar's built-in texturing system. If you've used Substance Painter, Armorpaint, or any
              layer-based image editor, the workflow will feel familiar — but it's integrated directly
              into your 3D environment with no export/import roundtrip. Build materials by stacking
              layers, each contributing to any PBR channel, with full mask and blend mode control.
            </p>

            {/* PBR Channels */}
            <div id="pbr-channels" className="docs-feature">
              <h3 className="docs-feature-title">PBR Channels</h3>
              <p>
                Every material in Mixar is defined by standard PBR (Physically Based Rendering)
                channels:
              </p>
              <ul className="docs-list">
                <li>
                  <strong>Base Color</strong> — The surface's diffuse color, independent of lighting.
                  What the material "looks like" in neutral light.
                </li>
                <li>
                  <strong>Roughness</strong> — How smooth or rough the surface is. 0 is a perfect
                  mirror, 1 is completely matte. Most real-world materials fall between 0.2 and 0.8.
                </li>
                <li>
                  <strong>Metallic</strong> — Whether the surface is metallic (1) or non-metallic (0).
                  In practice, almost always either 0 or 1.
                </li>
                <li>
                  <strong>Normal</strong> — Surface detail that affects how light bounces without
                  changing actual geometry. Scratches, pores, dents — anything too fine for mesh
                  geometry.
                </li>
              </ul>
              <p>
                You can also add additional channels like Height (displacement), Ambient Occlusion, and
                Emissive depending on your project.
              </p>
            </div>

            {/* Layer Types */}
            <div id="layer-types" className="docs-feature">
              <h3 className="docs-feature-title">Layer Types</h3>

              <p className="docs-subheading">Fill Layer</p>
              <p>
                A uniform value or image applied across the entire mesh (or masked region). Use fill
                layers for base material colors, flat property values, or loading image textures as
                the base.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/fill-layer.png"
                alt="Fill Layer interface"
                className="docs-feature-image"
              />

              <p className="docs-subheading">Paint Layer</p>
              <p>
                A layer you paint on directly in the 3D viewport using brushes. Use paint layers for
                hand-painted detail — edge wear, dirt accumulation, color variation, and artistic
                touches that procedurals can't handle.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/paint-layer.png"
                alt="Paint Layer interface"
                className="docs-feature-image"
              />

              <p className="docs-subheading">Image as Channel Maps</p>
              <p>
                Import existing texture maps (from a scan, another tool, or AI generation) and assign
                them to specific PBR channels. Use these when you already have textures from another
                pipeline or when you've generated PBR maps using the Moodboard and want to load them
                as layers for further refinement.
              </p>

              <p className="docs-subheading">Building a material — typical layer stack</p>
              <ol className="docs-steps">
                <li>
                  <strong>Fill Layer — Base</strong> — Set the overall color, roughness, and metallic
                  values. This is your foundation.
                </li>
                <li>
                  <strong>Fill Layer — Primary Texture</strong> — Load an image texture or procedural
                  pattern for the main surface detail.
                </li>
                <li>
                  <strong>Fill Layer — Weathering</strong> — Add wear and aging effects. Use
                  procedural masks (AO, curvature, edge detect) so effects follow the geometry
                  naturally.
                </li>
                <li>
                  <strong>Paint Layer — Manual Detail</strong> — Paint specific details —
                  logos, unique damage marks, artistic accents.
                </li>
                <li>
                  <strong>Fill Layer — Final Adjustments</strong> — Subtle overall tweaks to roughness
                  or color balance.
                </li>
              </ol>
              <p>
                Each layer has per-channel controls: color, roughness, metallic, and normal can be set
                independently per layer, with their own blend modes and opacity.
              </p>
            </div>

            {/* Masks */}
            <div id="masks" className="docs-feature">
              <h3 className="docs-feature-title">Masks</h3>
              <p>
                Every layer can have one or more masks that control where the layer is visible. Where
                the mask is white, the layer shows through. Where it's black, the layer is hidden.
              </p>

              <p className="docs-subheading">Mask types</p>
              <ul className="docs-list">
                <li>
                  <strong>Painted</strong> — Paint directly to reveal or hide parts of a layer
                </li>
                <li>
                  <strong>Image-based</strong> — Use an imported image as a mask
                </li>
                <li>
                  <strong>Procedural</strong> — Generated from patterns (noise, bricks, checker,
                  voronoi, waves) or mesh data (ambient occlusion, edge detection, curvature)
                </li>
                <li>
                  <strong>Geometry-driven</strong> — Use baked mesh maps like AO, cavity, or
                  curvature. This is how you get effects like "dirt accumulates in crevices" or "edges
                  wear down to bare metal"
                </li>
              </ul>
              <p>
                Masks also support modifiers — invert, ramp (remap values with a color curve), and
                curve adjustments — for fine-tuning without repainting.
              </p>

              <p className="docs-subheading">Blend modes</p>
              <ul className="docs-list">
                <li>
                  <strong>Mix</strong> — Standard alpha blending. The default for most layers.
                </li>
                <li>
                  <strong>Multiply</strong> — Darkens. Great for shadow layers, AO overlays, and
                  dirt.
                </li>
                <li>
                  <strong>Screen</strong> — Lightens. Useful for highlights and glow effects.
                </li>
                <li>
                  <strong>Overlay</strong> — Adds contrast. Good for adding variation to an existing
                  base.
                </li>
                <li>
                  <strong>Add / Subtract</strong> — Direct value adjustment. Useful for tweaking
                  roughness or metallic values.
                </li>
              </ul>
            </div>

            {/* Painting */}
            <div id="painting" className="docs-feature">
              <h3 className="docs-feature-title">Painting</h3>
              <p>
                When a Paint Layer is active, you paint directly on your mesh in the 3D viewport. The
                brush system gives you full control:
              </p>

              <ul className="docs-list">
                <li>
                  <strong>Radius</strong> — Brush size in pixels
                </li>
                <li>
                  <strong>Strength</strong> — Paint intensity per stroke
                </li>
                <li>
                  <strong>Blend mode</strong> — How the brush blends with existing content
                </li>
                <li>
                  <strong>Falloff</strong> — How strength decreases from center to edge (smooth,
                  sharp, linear, or custom curve)
                </li>
                <li>
                  <strong>Stroke type</strong> — Spacing, airbrush, line, curve
                </li>
                <li>
                  <strong>Texture</strong> — Apply a texture pattern to the brush tip for natural
                  variation
                </li>
                <li>
                  <strong>Alpha mask</strong> — Shape the brush tip with a mask texture
                </li>
              </ul>

              <div className="docs-tip">
                <p className="docs-tip-title">Painting tips</p>
                <ul className="docs-list">
                  <li>
                    Use low strength (0.1–0.3) and build up gradually for natural-looking results
                  </li>
                  <li>
                    Paint on a separate layer for each type of detail — keeps everything editable
                  </li>
                  <li>
                    Use the Normal Falloff setting to prevent painting on surfaces angled away from
                    the camera
                  </li>
                </ul>
              </div>
            </div>

            {/* Mesh Baking */}
            <div id="mesh-baking" className="docs-feature">
              <h3 className="docs-feature-title">Mesh Baking</h3>
              <p>
                Bake mesh-based maps that capture information about your geometry. These are primarily
                used as mask inputs for your layer stack.
              </p>

              <ul className="docs-list">
                <li>
                  <strong>Ambient Occlusion</strong> — Shadows in crevices and contact areas
                </li>
                <li>
                  <strong>Curvature (Pointiness)</strong> — Detects edges and convex surfaces
                </li>
                <li>
                  <strong>Cavity</strong> — Identifies concave areas
                </li>
                <li>
                  <strong>Dust</strong> — Simulates dust accumulation based on surface orientation
                </li>
                <li>
                  <strong>Bevel</strong> — Simulates rounded edges without adding geometry
                </li>
                <li>
                  <strong>Position</strong> — World-space position for procedural gradients and
                  effects
                </li>
              </ul>

              <p>
                For example: bake an AO map, then use it as a mask on a dirt layer so grime
                accumulates in crevices naturally. Or use curvature to create edge wear that follows
                the actual shape of your model.
              </p>
            </div>

            {/* Baking & Export */}
            <div id="baking-and-export" className="docs-feature">
              <h3 className="docs-feature-title">Baking & Export</h3>
              <p>When your material is complete, bake the entire layer stack down to standard texture maps:</p>

              <ol className="docs-steps">
                <li>
                  <strong>Bake All Channels</strong> — Renders every layer into final per-channel
                  texture maps (Color, Metallic, Roughness, Normal)
                </li>
                <li>
                  <strong>Preview</strong> — Inspect each baked channel individually to verify quality
                </li>
                <li>
                  <strong>Export</strong> — Save maps as image files for use in game engines,
                  renderers, or other applications
                </li>
              </ol>

              <p>
                The baked output is standard PBR texture maps that work with any modern rendering
                pipeline — Unreal, Unity, Godot, Arnold, V-Ray, Cycles, or any engine that supports
                PBR materials.
              </p>
            </div>

            {/* Material Assets — brief mention */}
            <div className="docs-feature">
              <h3 className="docs-feature-title">Material Assets</h3>
              <p>
                Mixar includes a built-in library of procedural materials — wood, metal, fabric, stone,
                brick, ceramic, and more. Browse by category, search by name, and apply to any layer
                with a single click. They're fully procedural, so they adapt to any UV layout and can
                be customized through their properties.
              </p>
              <img
                src="https://d2znch1yzypu23.cloudfront.net/docs/assets.png"
                alt="Material Assets library"
                className="docs-feature-image"
              />
            </div>
          </section>

          <hr className="docs-divider" />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/*  WORKFLOWS                                                           */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <section id="workflows" className="docs-section">
            <h2 className="docs-section-title">Putting It All Together</h2>
            <p className="docs-section-intro">
              Mixar's features are designed to flow into each other. Here are some common end-to-end
              workflows.
            </p>

            <div className="docs-workflow-grid">
              <div className="docs-workflow-card">
                <p className="docs-workflow-card-title">Concept to Finished Asset</p>
                <ol className="docs-steps">
                  <li>
                    <strong>Image Generation</strong> — Generate concept art from a text description
                  </li>
                  <li>
                    <strong>Image to 3D</strong> — Convert the best concept into a 3D model
                  </li>
                  <li>
                    <strong>Retopology</strong> — Clean up the mesh topology
                  </li>
                  <li>
                    <strong>Modeling</strong> — Refine geometry, fix any issues
                  </li>
                  <li>
                    <strong>UV Editing</strong> — Unwrap and pack UVs
                  </li>
                  <li>
                    <strong>PBR Map Generation</strong> — Generate initial textures
                  </li>
                  <li>
                    <strong>Layer Painting</strong> — Refine materials, add detail
                  </li>
                  <li>
                    <strong>Export</strong> — Bake and export final texture maps
                  </li>
                </ol>
              </div>

              <div className="docs-workflow-card">
                <p className="docs-workflow-card-title">Photo to 3D Scene</p>
                <ol className="docs-steps">
                  <li>
                    <strong>Import</strong> a reference photo to the moodboard
                  </li>
                  <li>
                    <strong>Generate Scene</strong> — Convert the entire photo into a 3D scene
                  </li>
                  <li>
                    <strong>Retopology</strong> — Simplify meshes as needed
                  </li>
                  <li>
                    <strong>Layer Painting</strong> — Refine materials on each object
                  </li>
                  <li>Adjust placement, lighting, and camera</li>
                </ol>
              </div>

              <div className="docs-workflow-card">
                <p className="docs-workflow-card-title">Quick Blockout Exploration</p>
                <ol className="docs-steps">
                  <li>
                    <strong>Model</strong> a rough blockout using basic shapes
                  </li>
                  <li>
                    <strong>Blockout to Render</strong> — Generate multiple style variations
                  </li>
                  <li>Use the renders to align on art direction</li>
                  <li>Proceed to detailed modeling and texturing</li>
                </ol>
              </div>
            </div>
          </section>

          <hr className="docs-divider" />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/*  KEYBOARD SHORTCUTS                                                  */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <section id="shortcuts" className="docs-section">
            <h2 className="docs-section-title">Keyboard Shortcuts</h2>
            <p className="docs-section-intro">
              The most frequently used shortcuts across Mixar's workspaces.
            </p>

            <div className="docs-shortcuts-grid">
              <div className="docs-shortcuts-group">
                <h4>Transforms</h4>
                <Shortcut label="Move" keys={["G"]} />
                <Shortcut label="Rotate" keys={["R"]} />
                <Shortcut label="Scale" keys={["S"]} />
                <Shortcut label="Constrain to axis" keys={["X", "Y", "Z"]} />
                <Shortcut label="Extrude" keys={["E"]} />
                <Shortcut label="Loop Cut" keys={["Ctrl", "R"]} />
                <Shortcut label="Knife Tool" keys={["K"]} />
                <Shortcut label="Merge" keys={["M"]} />
              </div>

              <div className="docs-shortcuts-group">
                <h4>Selection</h4>
                <Shortcut label="Vertex Select" keys={["1"]} />
                <Shortcut label="Edge Select" keys={["2"]} />
                <Shortcut label="Face Select" keys={["3"]} />
                <Shortcut label="Select All" keys={["A"]} />
                <Shortcut label="Deselect All" keys={["Alt", "A"]} />
                <Shortcut label="Box Select" keys={["B"]} />
                <Shortcut label="Circle Select" keys={["C"]} />
                <Shortcut label="Select Linked" keys={["L"]} />
              </div>

              <div className="docs-shortcuts-group">
                <h4>Viewport</h4>
                <Shortcut label="Frame Selected" keys={["Numpad ."]} />
                <Shortcut label="Toggle X-Ray" keys={["Alt", "Z"]} />
                <Shortcut label="Shading Pie Menu" keys={["Z"]} />
                <Shortcut label="Mark Seam" keys={["Ctrl", "E"]} />
                <Shortcut label="Unwrap" keys={["U"]} />
              </div>

              <div className="docs-shortcuts-group">
                <h4>UV Editor</h4>
                <Shortcut label="Move UVs" keys={["G"]} />
                <Shortcut label="Rotate UVs" keys={["R"]} />
                <Shortcut label="Scale UVs" keys={["S"]} />
                <Shortcut label="Select All" keys={["A"]} />
                <Shortcut label="Box Select" keys={["B"]} />
              </div>

              <div className="docs-shortcuts-group">
                <h4>Moodboard</h4>
                <Shortcut label="Send to Chat" keys={["Ctrl", "P"]} />
                <Shortcut label="Move image" keys={["G"]} />
                <Shortcut label="Rotate image" keys={["R"]} />
                <Shortcut label="Scale image" keys={["S"]} />
                <Shortcut label="Select All" keys={["A"]} />
                <Shortcut label="Quick-access pie menu" keys={["Tab"]} />
              </div>

              <div className="docs-shortcuts-group">
                <h4>Moodboard AI Features</h4>
                <Shortcut label="Image Generation" keys={["Ctrl", "Shift", "1"]} />
                <Shortcut label="Generate PBR Maps" keys={["Ctrl", "Shift", "3"]} />
                <Shortcut label="Image to 3D" keys={["Ctrl", "Shift", "4"]} />
                <Shortcut label="Segment to 3D" keys={["Ctrl", "Shift", "5"]} />
                <Shortcut label="Generate Scene" keys={["Ctrl", "Shift", "7"]} />
              </div>
            </div>
          </section>

          {/* Footer note */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 40 }}>
            This documentation covers Mixar 2.0. Features are continuously being improved and
            expanded.
          </p>
        </main>
      </div>
    </div>
  );
}

/* ── Shortcut helper component ── */
function Shortcut({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="docs-shortcut-row">
      <span className="docs-shortcut-label">{label}</span>
      <span className="docs-shortcut-key">
        {keys.map((k, i) => (
          <span key={i}>
            <kbd>{k}</kbd>
            {i < keys.length - 1 && <span style={{ margin: "0 2px", color: "rgba(255,255,255,0.3)" }}>+</span>}
          </span>
        ))}
      </span>
    </div>
  );
}
