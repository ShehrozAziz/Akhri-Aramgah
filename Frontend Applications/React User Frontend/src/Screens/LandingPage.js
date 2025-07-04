import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styling/Landing.css";
import logo2 from "../Assets/Logo2.png";
import about from "../Assets/bg removed.png";
import morgue from "../Assets/morgue.jpeg";
import transport from "../Assets/transport.jpeg";
import catering from "../Assets/catering.jpeg";
import Footer from "../Components/Footer";
import { useState } from "react";
import LandingPageForm from "../Components/LandingPageForm";

/* global ScrollReveal */

export default function LandingPage() {
  useEffect(() => {
    const loadScript = (url, callback) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = callback;
      document.head.appendChild(script);
    };

    // Load ScrollReveal and apply animations
    loadScript("https://unpkg.com/scrollreveal", () => {
      const scrollRevealOption = {
        distance: "50px",
        origin: "bottom",
        duration: 500,
      };

      // Applying ScrollReveal to elements
      ScrollReveal().reveal(".header__container p", {
        ...scrollRevealOption,
      });

      ScrollReveal().reveal(".header__container h1", {
        ...scrollRevealOption,
        delay: 250,
      });

      ScrollReveal().reveal(".about__image img", {
        ...scrollRevealOption,
        origin: "left",
      });

      ScrollReveal().reveal(".about__content .section__subheader", {
        ...scrollRevealOption,
        delay: 250,
      });

      ScrollReveal().reveal(".about__content .section__header", {
        ...scrollRevealOption,
        delay: 250,
      });

      ScrollReveal().reveal(".about__content .section__description", {
        ...scrollRevealOption,
        delay: 250,
      });

      ScrollReveal().reveal(".about__btn", {
        ...scrollRevealOption,
        delay: 1000,
      });

      ScrollReveal().reveal(".room__card", {
        ...scrollRevealOption,
        interval: 250,
      });

      ScrollReveal().reveal(".service__list li", {
        ...scrollRevealOption,
        interval: 250,
        origin: "right",
      });
    });
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="header">
        <nav className="landing-navbar">
          <div className="nav__bar">
            <div className="logo">
              <a href="#">
                <img className="landing-img" src={logo2} alt="logo" />
              </a>
            </div>
            <div className="nav__menu__btn" onClick={toggleMenu} id="menu-btn">
              <i className={isMenuOpen ? "ri-close-line" : "ri-menu-line"}></i>
            </div>
          </div>
          <ul
            className={`nav__links ${isMenuOpen ? "open" : ""}`}
            id="nav-links"
          >
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contractor">Contractors</a>
            </li>
            <li>
              <a href="#service">Services</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div className="section__container header__container" id="home">
          <h1 dir="rtl">إِنَّا لِلّهِ وَإِنَّـا إِلَيْهِ رَاجِعونَ</h1>
        </div>
      </header>

      <section className="section__container booking__container">
        <form action="/" className="booking__form">
          <div className="input__group">
            <span>
              <i className="ri-shield-star-line"></i>
            </span>
            <div>
              <label for="check-in">Fully Secure</label>
            </div>
          </div>
          <div className="input__group">
            <span>
              <i className="ri-time-line"></i>
            </span>
            <div>
              <label for="check-out">Timely Services</label>
            </div>
          </div>
          <div className="input__group">
            <span>
              <i className="ri-customer-service-2-line"></i>
            </span>
            <div>
              <label for="guest">Customer Support</label>
            </div>
          </div>
          <div className="input__group input__btn">
            <Link
              to="/login"
              className="custom-btn"
              style={{ textDecoration: "none", color: "white" }}
            >
              <i className="ri-user-line"></i> Your Account
            </Link>
          </div>
        </form>
      </section>

      <section className="section__container about__container" id="about">
        <div className="about__image">
          <img className="landing-img" src={about} alt="about" />
        </div>
        <div className="about__content">
          <p className="section__subheader">ABOUT US</p>
          <h2 className="section__header">
            Here for You in Life's Most Difficult Moments
          </h2>
          <p className="section__description landing-text">
            Our platform is dedicated to simplifying and dignifying the process
            of funeral planning and graveyard management. From booking
            gravesites to coordinating funeral services, we provide a
            centralized solution that ensures all your needs are met with
            compassion, efficiency, and respect. With a focus on easing the
            burden during difficult times, we connect you to trusted service
            providers, offering everything from transportation and catering to
            real-time grave monitoring and advanced technology solutions for
            graveyard management.
          </p>
          <div className="about__btn">
            <a href="#contractors">
              <button className="custom-btn">Read More</button>
            </a>
          </div>
        </div>
      </section>

      <section className="section__container room__container" id="contractor">
        <p className="section__subheader">OUR PLATFORM BRINGS TOGETHER</p>
        <h2 className="section__header">Contractors</h2>
        <div className="room__grid">
          <div className="room__card">
            <div className="room__card__image">
              <img className="landing-img" src={transport} alt="Transport" />
              <div className="room__card__icons"></div>
            </div>
            <div className="room__card__details">
              <h4 className="landing-text">Transporters</h4>
              <p className="landing-text">
                Trusted and compassionate service providers, ready to handle all
                transportation arrangements with care and professionalism.
              </p>
            </div>
          </div>
          <div className="room__card">
            <div className="room__card__image">
              <img className="landing-img" src={catering} alt="Catering" />
              <div className="room__card__icons"></div>
            </div>
            <div className="room__card__details">
              <h4 className="landing-text">Caterers</h4>
              <p className="landing-text">
                Reliable and empathetic caterers, committed to providing
                respectful meal services and arranging seating with the utmost
                care and professionalism for funeral arrangements.
              </p>
            </div>
          </div>
          <div className="room__card">
            <div className="room__card__image">
              <img className="landing-img" src={morgue} alt="Morgue" />
              <div className="room__card__icons"></div>
            </div>
            <div className="room__card__details">
              <h4 className="landing-text">Morgues</h4>
              <p className="landing-text">
                Safe and secure, our morgues offer a dignified space to store
                your loved ones with utmost care, providing peace of mind while
                final arrangements are prepared.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="service" id="service">
        <div className="section__container service__container">
          <div className="service__content">
            <p className="section__subheader">SERVICES</p>
            <h2 className="section__header">Strive Only For The Best.</h2>
            <ul className="service__list">
              <li>
                <span>
                  <i className="ri-bookmark-2-line"></i>
                </span>
                Grave Booking
              </li>
              <li>
                <span>
                  <i className="ri-macbook-line"></i>
                </span>
                Manage Funeral Services
              </li>

              <li>
                <span>
                  <i className="ri-database-2-line"></i>
                </span>
                Data Collection
              </li>
              <li>
                <span>
                  <i className="ri-search-line"></i>
                </span>
                Facial Recognition based Seaching
              </li>
            </ul>
          </div>
        </div>
      </section>
      <LandingPageForm></LandingPageForm>
      <Footer></Footer>
    </>
  );
}
