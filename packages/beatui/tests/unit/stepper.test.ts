import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import {
  Stepper,
  createStepper,
} from '../../src/components/navigation/stepper'
import { BeatUI } from '../../src/components/beatui'

describe('Stepper', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  const basicSteps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ]

  it('should render with step indicators', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    expect(container.querySelector('.bc-stepper')).not.toBeNull()
    expect(container.querySelector('.bc-stepper__indicators')).not.toBeNull()

    const steps = container.querySelectorAll('.bc-stepper__step')
    expect(steps.length).toBe(3)
  })

  it('should mark first step as active by default', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    const steps = container.querySelectorAll('.bc-stepper__step')
    expect(steps[0].classList.contains('bc-stepper__step--active')).toBe(true)
    expect(steps[1].classList.contains('bc-stepper__step--pending')).toBe(true)
    expect(steps[2].classList.contains('bc-stepper__step--pending')).toBe(true)
  })

  it('should show step labels', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    const labels = container.querySelectorAll('.bc-stepper__label-text')
    expect(labels[0].textContent).toBe('Step 1')
    expect(labels[1].textContent).toBe('Step 2')
    expect(labels[2].textContent).toBe('Step 3')
  })

  it('should render connector lines between steps', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    const connectors = container.querySelectorAll('.bc-stepper__connector')
    expect(connectors.length).toBe(2) // between 3 steps
  })

  it('should navigate via controller', async () => {
    const onChange = vi.fn()
    const [node, ctrl] = createStepper({
      steps: basicSteps,
      onChange,
    })

    render(BeatUI({}, node), container)

    await ctrl.goTo(1)
    expect(onChange).toHaveBeenCalledWith(1)

    await vi.waitFor(() => {
      const steps = container.querySelectorAll('.bc-stepper__step')
      expect(steps[0].classList.contains('bc-stepper__step--completed')).toBe(true)
      expect(steps[1].classList.contains('bc-stepper__step--active')).toBe(true)
    })
  })

  it('should advance with next()', async () => {
    const onChange = vi.fn()
    const [node, ctrl] = createStepper({
      steps: basicSteps,
      onChange,
    })

    render(BeatUI({}, node), container)

    const result = await ctrl.next()
    expect(result).toBe(true)
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('should go back with prev()', async () => {
    const [node, ctrl] = createStepper({
      steps: basicSteps,
      value: 2,
    })

    render(BeatUI({}, node), container)

    ctrl.prev()
    expect(ctrl.currentStep.value).toBe(1)
  })

  it('should respect beforeNext validation', async () => {
    const beforeNext = vi.fn().mockResolvedValue(false)
    const onChange = vi.fn()

    const [node, ctrl] = createStepper({
      steps: [
        { label: 'Step 1', beforeNext },
        { label: 'Step 2' },
      ],
      onChange,
    })

    render(BeatUI({}, node), container)

    const result = await ctrl.next()
    expect(result).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    expect(beforeNext).toHaveBeenCalledTimes(1)
  })

  it('should hide navigation buttons by default', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    const nav = container.querySelector('.bc-stepper__navigation')
    expect(nav).toBeNull()
  })

  it('should show navigation when showNavigation is true', () => {
    render(
      BeatUI({}, Stepper({ steps: basicSteps, showNavigation: true })),
      container
    )

    const nav = container.querySelector('.bc-stepper__navigation')
    expect(nav).not.toBeNull()
  })

  it('should apply orientation class', () => {
    render(
      BeatUI(
        {},
        Stepper({ steps: basicSteps, orientation: 'vertical' })
      ),
      container
    )

    const stepper = container.querySelector('.bc-stepper')
    expect(stepper?.classList.contains('bc-stepper--vertical')).toBe(true)
  })

  it('should apply size class', () => {
    render(
      BeatUI({}, Stepper({ steps: basicSteps, size: 'lg' })),
      container
    )

    const stepper = container.querySelector('.bc-stepper')
    expect(stepper?.classList.contains('bc-stepper--size-lg')).toBe(true)
  })

  it('should apply disabled state', () => {
    render(
      BeatUI({}, Stepper({ steps: basicSteps, disabled: true })),
      container
    )

    const stepper = container.querySelector('.bc-stepper')
    expect(stepper?.classList.contains('bc-stepper--disabled')).toBe(true)
  })

  it('should set and clear error state', async () => {
    const [node, ctrl] = createStepper({ steps: basicSteps })
    render(BeatUI({}, node), container)

    ctrl.setError(1)
    await vi.waitFor(() => {
      const steps = container.querySelectorAll('.bc-stepper__step')
      expect(steps[1].classList.contains('bc-stepper__step--error')).toBe(true)
    })

    ctrl.clearError(1)
    await vi.waitFor(() => {
      const steps = container.querySelectorAll('.bc-stepper__step')
      expect(steps[1].classList.contains('bc-stepper__step--error')).toBe(false)
    })
  })

  it('should have proper ARIA attributes', () => {
    render(BeatUI({}, Stepper({ steps: basicSteps })), container)

    const stepper = container.querySelector('.bc-stepper')
    expect(stepper?.getAttribute('role')).toBe('group')

    const stepBtns = container.querySelectorAll('.bc-stepper__step')
    stepBtns.forEach(btn => {
      expect(btn.getAttribute('role')).toBe('button')
      expect(btn.getAttribute('tabindex')).toBe('0')
    })
  })

  it('should navigate on step click', async () => {
    const onChange = vi.fn()
    render(
      BeatUI({}, Stepper({ steps: basicSteps, onChange })),
      container
    )

    const steps = container.querySelectorAll('.bc-stepper__step')
    ;(steps[2] as HTMLElement).click()

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(2)
    })
  })
})
