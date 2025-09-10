import { render, screen } from '@/lib/test-utils'
import Logo from '../Logo'

describe('Logo Component', () => {
  it('renders logo with default props', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('AstroZi Logo')
    expect(logoImage).toBeInTheDocument()
    expect(logoImage).toHaveAttribute('src', '/logo.svg')
  })

  it('applies custom className', () => {
    const customClass = 'custom-logo-class'
    render(<Logo className={customClass} />)
    
    const logoContainer = screen.getByRole('img').parentElement
    expect(logoContainer).toHaveClass(customClass)
  })

  it('renders with custom size', () => {
    render(<Logo size={64} />)
    
    const logoImage = screen.getByAltText('AstroZi Logo')
    expect(logoImage).toHaveAttribute('width', '64')
    expect(logoImage).toHaveAttribute('height', '64')
  })

  it('is accessible', () => {
    render(<Logo />)
    
    const logoImage = screen.getByRole('img')
    expect(logoImage).toHaveAttribute('alt', 'AstroZi Logo')
  })
})