import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';

import { Link } from './Link.js';

export default {
  title: 'Primitives/Link',
};

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
      <div className="flex flex-col gap-3">
        <div>
          <Link variant="default" href="#">
            Default link
          </Link>
          <span className="ml-4 text-sm text-muted-foreground">
            Underlined, slightly fades on hover
          </span>
        </div>
        <div>
          <Link variant="muted" href="#">
            Muted link
          </Link>
          <span className="ml-4 text-sm text-muted-foreground">Underlined, brightens on hover</span>
        </div>
        <div>
          <Link variant="unstyled" href="#">
            Unstyled link
          </Link>
          <span className="ml-4 text-sm text-muted-foreground">No underline, inherits parent</span>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">With Icons</h2>
      <div className="flex flex-col gap-3">
        <Link variant="muted" href="#" icon={File} iconColor="#78716c">
          Pages
        </Link>
        <Link variant="muted" href="#" icon={User} iconColor="#ffb74d">
          People
        </Link>
        <Link variant="muted" href="#" icon={Calendar} iconColor="#81c784">
          Events
        </Link>
        <Link variant="default" href="#" icon={ArrowSquareOut}>
          External link
        </Link>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">In Context</h2>
      <p className="text-sm text-foreground">
        Here is some text with an <Link href="#">inline link</Link> in the middle of a paragraph.
        You can also have{' '}
        <Link variant="muted" href="#">
          muted links
        </Link>{' '}
        that are more subtle.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">With Click Handler</h2>
      <div className="flex gap-4">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert('Clicked!');
          }}
          variant="default"
        >
          Click me
        </Link>
        <Link
          href="#"
          variant="muted"
          icon={File}
          iconColor="#78716c"
          onClick={(e) => {
            e.preventDefault();
            alert('Navigating to Pages');
          }}
        >
          Pages (click handler)
        </Link>
      </div>
    </section>
  </div>
);

export const Variants: Story = () => (
  <div className="flex flex-col gap-4 p-6">
    <Link variant="default" href="#">
      Default link style
    </Link>
    <Link variant="muted" href="#">
      Muted link style
    </Link>
    <Link variant="unstyled" href="#">
      Unstyled link
    </Link>
  </div>
);

export const WithIcons: Story = () => (
  <div className="flex flex-col gap-4 p-6">
    <Link variant="muted" href="#" icon={File} iconColor="#78716c">
      Pages
    </Link>
    <Link variant="muted" href="#" icon={User} iconColor="#ffb74d">
      People
    </Link>
    <Link variant="muted" href="#" icon={Calendar} iconColor="#81c784">
      Events
    </Link>
  </div>
);

export const InParagraph: Story = () => (
  <div className="max-w-md p-6">
    <p className="text-sm leading-relaxed">
      TypeNote is a local-first knowledge management application. Learn more in our{' '}
      <Link href="#">documentation</Link>. For support, visit the <Link href="#">help center</Link>{' '}
      or{' '}
      <Link variant="muted" href="#">
        contact us
      </Link>
      .
    </p>
  </div>
);
