import { ChevronDown } from 'lucide-react'
import { business } from '../data/config'

const faqs = [
  {
    q: 'How is the price calculated?',
    a: 'Most services are priced per square foot of the area we work on, and sofa shampooing is priced per seat. Pick your service and size online and you’ll see the full price before you book.',
  },
  {
    q: 'Which areas do you serve?',
    a: `We serve homes and offices across ${business.city}, ${business.state} — including ${business.areas.join(', ')}. Outside these areas? Book anyway or call us and we’ll confirm if we can reach you.`,
  },
  {
    q: 'Do I need to be home during the service?',
    a: 'Someone should be present to let our team in and do a quick walkthrough at the end. Add any landmark or gate-pass details when you book.',
  },
  {
    q: 'Do you bring your own equipment and chemicals?',
    a: 'Yes. Our team arrives with professional machines, tools and safe, approved cleaning and pest-control products.',
  },
  {
    q: 'Is pest control safe for kids and pets?',
    a: 'We use low-odour, approved treatments. Our technician will tell you which areas to avoid and for how long after the service.',
  },
  {
    q: 'What if I’m not happy with the service?',
    a: 'Tell us within 24 hours and we’ll come back to redo the areas you’re not happy with — free of charge.',
  },
  {
    q: 'When and how do I pay?',
    a: 'Nothing is charged online. You pay after the service is done. You can reschedule or cancel free up to 24 hours before your slot.',
  },
]

export default function Faq() {
  return (
    <div className="faq">
      {faqs.map((f, i) => (
        <details key={f.q} className="faq__item" open={i === 0}>
          <summary>
            {f.q}
            <ChevronDown size={20} className="faq__chevron" />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}
