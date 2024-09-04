import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-[#0affed] w-full py-3 text-sm">
      <div className="container flex flex-col justify-center items-center gap-2">
        <span className="text-[10px]">© {new Date().getFullYear()} Nexim</span>
        <div className="flex gap-4">
          <a href="https://github.com/usenexim" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub size={16} />
          </a>
          <a href="https://www.instagram.com/usenexim/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            {/* <FaInstagram className="w-5 h-5" /> */}
            <FaInstagram size={16} />
          </a>
          <a href="https://twitter.com/usenexim" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter size={16} />
          </a>
          <a href="https://www.linkedin.com/company/usenexim/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}