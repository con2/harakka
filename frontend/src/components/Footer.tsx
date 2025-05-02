import { FacebookIcon, InstagramIcon, YoutubeIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-8 mt-4 text-left text-sm">
          <div className="flex flex-col flex-1">
            <h3>SHOP</h3>
            <ul className="text-left">
              <li>
                <a href="/storage">Products</a>
              </li>
              <li>
                <a href="/cart">Cart</a>
              </li>
              <li>
                <a href="/checkout">Checkout</a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>ABOUT</h3>
            <ul className="text-left">
              <li>
                <a href="/howItWorks">User Guides</a>
              </li>
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-of-use">Terms of Use</a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>STAY UP TO DATE</h3>
            <div className="flex flex-col gap-2">
              <p>Be the first to know about new LARP events, products, or venues in Finland:</p>
              {/* TODO: Add link */}
              <p className="underline"><a href="" target="_blank">Subscribe to our newsletter</a></p>
            </div>
            <div className="flex flex-row items-center mt-4 justify-between gap-4">
              <h4>FOLLOW US ON</h4>
              <div className="flex gap-2">
                <a href="https://www.instagram.com/illusia_ry/" target="_blank" rel="noopener noreferrer">
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/illusiary/" target="_blank" rel="noopener noreferrer">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                {/* TODO: Add link */}
                <a href="https://www.youtube.com/@illusia" target="_blank" rel="noopener noreferrer">
                  <YoutubeIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-10 text-sm">&copy; {new Date().getFullYear()} Illusia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
