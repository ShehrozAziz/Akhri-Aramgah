import React from "react";
import logo2 from "../Assets/Logo2.png";
import facebook from "../Assets/facebook.png";
import twitter from "../Assets/twitter.png";
import instagram from "../Assets/instagram.png";
import youtube from "../Assets/youtube.png";
export default function Footer() {
  return (
    <>
      <footer class="footer">
        <div class="section__container footer__container">
          <div class="footer__col">
            <div class="logo">
              <a href="#home">
                <img class="landing-img" src={logo2} alt="logo" />
              </a>
            </div>

            <p class="section__description landing-text">
              Discover a world of comfort, luxury, and adventure as you explore
              our curated selection of hotels, making every moment of your
              getaway truly extraordinary.
            </p>
          </div>
          <div class="footer__col">
            <h4 className="landing-text">Features</h4>
            <ul class="footer__links">
              <li className="landing-text">Maximum Security</li>
              <li className="landing-text">Instant Response</li>
              <li className="landing-text">Centrallized Control</li>
              <li className="landing-text">Customer Support</li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 className="landing-text">Services</h4>
            <ul class="footer__links">
              <li className="landing-text">Grave Booking</li>
              <li className="landing-text">Funeral Services</li>
              <li className="landing-text">Centrallized Platform</li>
              <li className="landing-text">Intelligent Algorithms</li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 className="landing-text">Our Contact</h4>
            <ul class="footer__links">
              <li className="landing-text">
                <a className="landing-text" href="#">
                  AkhriAramgah@info.com
                </a>
              </li>
            </ul>
            <div class="footer__socials">
              <a href="#">
                <img class="landing-img" src={facebook} alt="facebook" />
              </a>
              <a href="#">
                <img class="landing-img" src={instagram} alt="instagram" />
              </a>
              <a href="#">
                <img class="landing-img" src={youtube} alt="youtube" />
              </a>
              <a href="#">
                <img class="landing-img" src={twitter} alt="twitter" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
