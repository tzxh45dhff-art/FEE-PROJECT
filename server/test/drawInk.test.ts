import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { fillPixels, INK_WIDTH, INK_HEIGHT } from '../../src/features/party/drawInk.ts'

function page(width: number, height: number) {
  const data = new Uint8ClampedArray(width * height * 4)
  data.fill(255)
  return data
}
describe('drawing bucket — connected regions', () => {
  it('fills only the connected side of a closed boundary', () => {
    const data = page(5, 4)
    for (let y = 0; y < 4; y++) {
      const i = (y * 5 + 2) * 4
      data[i] = data[i + 1] = data[i + 2] = 0
    }
    assert.equal(fillPixels(data, 5, 4, 0, 0, '#ff0000'), true)
    assert.deepEqual([...data.slice(0, 4)], [255, 0, 0, 255])
    assert.deepEqual([...data.slice(12, 16)], [255, 255, 255, 255])
    assert.deepEqual([...data.slice(8, 12)], [0, 0, 0, 255])
  })
  it('same-colour fills terminate immediately and edge clicks stay on the page', () => {
    const data = page(3, 2)
    assert.equal(fillPixels(data, 3, 2, 0, 0, '#ffffff'), false)
    assert.equal(fillPixels(data, 3, 2, 3, 2, '#000000'), true)
    assert.ok(data.every((v, i) => v === (i % 4 === 3 ? 255 : 0)))
  })
  it('fills the complete shared-resolution page without recursion or gaps', () => {
    const data = page(INK_WIDTH, INK_HEIGHT)
    fillPixels(data, INK_WIDTH, INK_HEIGHT, INK_WIDTH / 2, INK_HEIGHT / 2, '#e63946')
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 230 || data[i + 1] !== 57 || data[i + 2] !== 70 || data[i + 3] !== 255) assert.fail(`unfilled pixel ${i / 4}`)
    }
  })
})
