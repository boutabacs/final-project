import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { publicRequest, userRequest } from "../requestMethods";

const parseUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(() => parseUser());
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await publicRequest.get(`/products?search=${searchTerm.trim()}&limit=5`);
          setSuggestions(res.data);
        } catch (err) {
          console.error("Error fetching suggestions:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const loadCartPreview = useCallback(async () => {
    const u = parseUser();
    setUser(u);
    if (!u) {
      setCartItems([]);
      return;
    }
    setCartLoading(true);
    try {
      const res = await userRequest.get(`/carts/find/${u._id}`);
      if (!res.data?.products?.length) {
        setCartItems([]);
        return;
      }
      const results = await Promise.allSettled(
        res.data.products.map((p) =>
          publicRequest.get(`/products/find/${p.productId}`).then((prodRes) => ({
            ...prodRes.data,
            quantity: p.quantity,
          }))
        )
      );
      const items = results
        .filter((r) => r.status === "fulfilled" && r.value?._id)
        .map((r) => r.value);
      setCartItems(items);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartPreview();
  }, [loadCartPreview, location.pathname]);

  useEffect(() => {
    const onCartUpdated = () => loadCartPreview();
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, [loadCartPreview]);

  const cartLineCount = cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const subtotal = cartItems.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 0),
    0
  );

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  const menuItems = [
    { label: "Home", path: "/", hasDropdown: true },
    { label: "Shop", path: "/shop", hasDropdown: false },
    { label: "About", path: "/about", hasDropdown: false },
    { label: "News", path: "/news", hasDropdown: true },
    { label: "FAQ", path: "/faq", hasDropdown: false },
  ];

  const CartBadge = ({ className = "" }) => (
    <div
      className={`rounded-full border border-black flex items-center justify-center text-[12px] font-bold text-gray-900 ${className}`}
    >
      {user ? cartLineCount : 0}
    </div>
  );

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-3 flex justify-between items-center">
        <div className="flex xl:hidden items-center gap-4">
          <Link to="/cart" className="flex items-center gap-2 cursor-pointer group">
            <span className="text-[12px] font-normal leading-6 tracking-[0.05em] text-black uppercase font-sofia-pro">
              CART
            </span>
            <CartBadge className="w-8 h-8 border-gray-200 group-hover:border-black transition-all duration-300" />
          </Link>
          <button onClick={() => setIsSearchOpen(true)}>
            <FiSearch className="text-2xl text-black cursor-pointer stroke-[2px]" />
          </button>
        </div>

        <div className="hidden xl:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-1.5 group cursor-pointer hover:text-black transition-colors"
            >
              <span className="text-[12px] font-normal uppercase leading-6 tracking-[0.05em] text-black group-hover:text-black/50 transition-colors font-sofia-pro">
                {item.label}
              </span>
              {item.hasDropdown && (
                <IoIosArrowDown className="text-sm text-black group-hover:text-black/50 transition-colors" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex-1 flex justify-center lg:flex-initial">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.svg"
              alt="hubröbé"
              className="h-5 md:h-6 w-auto"
            />
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-10">
          <div className="flex flex-col items-end gap-0">
            <Link
              to="/wishlist"
              className="text-[12px] font-normal leading-tight tracking-[0.05em] text-black hover:text-black/50 uppercase font-sofia-pro transition-colors cursor-pointer"
            >
              WISHLIST
            </Link>
            {user ? (
              <div className="flex gap-4">
                <Link
                  to="/account"
                  className="text-[12px] font-normal leading-tight tracking-[0.05em] text-black hover:text-black/50 uppercase font-sofia-pro transition-colors cursor-pointer text-right"
                >
                  ACCOUNT
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[12px] font-normal leading-tight tracking-[0.05em] text-black hover:text-black/50 uppercase font-sofia-pro transition-colors cursor-pointer text-right"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[12px] font-normal leading-tight tracking-[0.05em] text-black hover:text-black/50 uppercase font-sofia-pro transition-colors cursor-pointer"
              >
                MY ACCOUNT
              </Link>
            )}
          </div>

          {/* CART + hover dropdown */}
          <div className="relative group">
            <Link to="/cart" className="flex items-center gap-3 py-2 cursor-pointer">
              <span className="text-[12px] font-normal leading-6 tracking-[0.05em] text-black group-hover:text-black/50 uppercase font-sofia-pro transition-colors">
                CART
              </span>
              <CartBadge className="w-9 h-9" />
            </Link>

            <div
              className="absolute right-0 top-full pt-2 z-[60] w-[min(100vw-2rem,380px)] opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-opacity duration-200"
              role="region"
              aria-label="Aperçu du panier"
            >
              <div className="border border-gray-200 bg-white shadow-sm max-h-[min(70vh,480px)] flex flex-col">
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:bg-transparent">
                  {!user ? (
                    <p className="px-6 py-10 text-center text-[14px] font-bold text-black font-sofia-pro">
                      Connectez-vous pour voir votre panier.
                    </p>
                  ) : cartLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : cartItems.length === 0 ? (
                    <p className="px-6 py-10 text-center text-[14px] font-bold text-black font-sofia-pro">
                      No products in the cart.
                    </p>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex gap-4 px-5 py-4 items-start"
                      >
                        <Link
                          to={`/product/${item?._id || item?.id}`}
                          className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden rounded-sm block"
                        >
                          <img
                            src={Array.isArray(item.img) ? item.img[0] : item.img}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] md:text-[14px] font-bold text-black font-gt-walsheim leading-snug line-clamp-2">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[13px] text-black/70 font-sofia-pro">
                            {item.quantity}x$
                            {Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {user && cartItems.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-white">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                        Subtotal
                      </span>
                      <span className="text-[18px] font-bold text-black font-sofia-pro">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-4 pt-0 pb-3 flex flex-col gap-2">
                      <Link
                        to="/checkout"
                        className="flex w-full items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest font-sofia-pro py-3.5 hover:bg-black transition-colors"
                      >
                        Checkout <span aria-hidden>›</span>
                      </Link>
                      <Link
                        to="/cart"
                        className="flex w-full items-center justify-center gap-2 text-black text-[11px] font-bold uppercase tracking-widest font-sofia-pro py-2 hover:text-black/70 transition-colors"
                      >
                        View cart
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="text-[12px] font-normal leading-6 tracking-[0.05em] text-black group-hover:text-black/50 uppercase font-sofia-pro transition-colors">
              SEARCH
            </span>
            <FiSearch className="text-2xl text-black/50 group-hover:text-black transition-colors stroke-[2.5px]" />
          </div>
        </div>

        <div className="flex xl:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-3xl text-black focus:outline-none p-1"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Full Screen Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-end p-8 md:p-12">
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="text-black hover:opacity-50 transition-opacity"
            >
              <FiX size={32} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <form onSubmit={handleSearch} className="w-full max-w-4xl relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Search for products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/10 py-6 md:py-10 text-[24px] md:text-[48px] font-bold font-sofia-pro outline-none focus:border-black transition-colors placeholder:text-black/10"
              />
              <button 
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
              >
                <FiSearch size={40} className="md:w-12 md:h-12" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {(suggestions.length > 0 || isSearching) && (
              <div className="w-full max-w-4xl mt-4 bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                {isSearching ? (
                  <div className="p-8 text-center text-black/40 font-sofia-pro text-[14px] uppercase tracking-widest">
                    Searching...
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-gray-50">
                    {suggestions.map((item) => (
                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchTerm("");
                          setSuggestions([]);
                        }}
                        className="flex items-center gap-6 p-6 hover:bg-gray-50 transition-all group"
                      >
                        <div className="w-16 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
                          <img 
                            src={item.img?.[0] || "/assets/placeholder.jpg"} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-[16px] font-bold text-black font-sofia-pro">{item.title}</h4>
                          <span className="text-[14px] text-black/40 font-sofia-pro uppercase tracking-widest">
                            {item.categories?.[0]}
                          </span>
                        </div>
                        <div className="ml-auto text-[16px] font-bold text-black font-sofia-pro">
                          ${item.price?.toFixed(2)}
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="p-6 text-center text-[12px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all font-sofia-pro"
                    >
                      View All Results for "{searchTerm}"
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="mt-8 text-[13px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-black/40 font-sofia-pro">
              Press enter to search or esc to close
            </p>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[65px] bg-white z-[90] overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-8">
            {/* Main Menu Links */}
            <div className="flex flex-col gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[18px] font-bold uppercase tracking-widest text-black font-sofia-pro hover:text-black/50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Account & Wishlist */}
            <div className="flex flex-col gap-6">
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="text-[14px] font-bold uppercase tracking-widest text-black font-sofia-pro flex items-center gap-3"
              >
                Wishlist
              </Link>
              
              {user ? (
                <div className="flex flex-col gap-6">
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[14px] font-bold uppercase tracking-widest text-black font-sofia-pro flex items-center gap-3"
                  >
                    My Account
                  </Link>
                  <div className="flex flex-col gap-4">
                    <span className="text-[14px] font-normal text-black/50 font-sofia-pro uppercase tracking-widest">
                      Logged in as {user.username}
                    </span>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-[14px] font-bold uppercase tracking-widest text-red-500 font-sofia-pro text-left"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[14px] font-bold uppercase tracking-widest text-black font-sofia-pro"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
