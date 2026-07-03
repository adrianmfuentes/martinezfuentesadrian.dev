// @vitest-environment node
import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/assets/route"

describe("GET /api/assets", () => {
  it("returns the expected cv and projects arrays", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.cv).toHaveLength(2)
    expect(body.projects).toHaveLength(6)
    expect(body.cv[0]).toMatchObject({ name: "cv_en.pdf", path: "/assets/cv/cv_en.pdf" })
    expect(body.projects[0]).toMatchObject({ name: "project_1.jpg" })
  })
})
