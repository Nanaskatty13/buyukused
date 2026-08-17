import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaMotorcycle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaLock,
} from "react-icons/fa";

import { riders } from "../services/api";

function RiderRegister() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      serviceArea: "",
      bikeType: "",
      bikeNumber: "",
      identificationNumber: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      // --------------------------------------------------------
      // PASSWORD MATCH
      // --------------------------------------------------------

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      // --------------------------------------------------------
      // PASSWORD LENGTH
      // --------------------------------------------------------

      if (
        form.password.length < 6
      ) {
        setError(
          "Password must be at least 6 characters."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await riders.register(
            form
          );

        setSuccess(
          response?.message ||
            "Your rider application has been submitted successfully."
        );

        // Clear sensitive fields.
        setForm((previous) => ({
          ...previous,
          password: "",
          confirmPassword: "",
        }));

        // Give the user time to read
        // the approval message.
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } catch (err) {
        console.error(
          "Rider registration error:",
          err
        );

        setError(
          err?.message ||
            "Unable to submit your rider application."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
            <FaMotorcycle
              size={28}
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Become a BUYUKUSED Rider
          </h1>

          <p className="mt-2 text-gray-600">
            Apply to deliver products
            and earn from completed
            deliveries.
          </p>
        </div>

        {/* =====================================================
            FORM CARD
        ====================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}

              <div className="mt-2 font-medium">
                Your account must be
                approved before you can
                accept deliveries.
              </div>
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >
            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Personal Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      required
                      minLength={2}
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="024 XXX XXXX"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Account Security
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={
                        form.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      required
                      minLength={6}
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                RIDER INFORMATION
            ================================================== */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Rider Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* SERVICE AREA */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Service Area
                  </label>

                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="serviceArea"
                      value={
                        form.serviceArea
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Accra, Tema, Kumasi..."
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* BIKE TYPE */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bike Type
                  </label>

                  <select
                    name="bikeType"
                    value={
                      form.bikeType
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-black"
                  >
                    <option value="">
                      Select bike type
                    </option>

                    <option value="Motorcycle">
                      Motorcycle
                    </option>

                    <option value="Scooter">
                      Scooter
                    </option>

                    <option value="Tricycle">
                      Tricycle
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* BIKE NUMBER */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bike Registration Number
                  </label>

                  <input
                    type="text"
                    name="bikeNumber"
                    value={
                      form.bikeNumber
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="e.g. GR-1234-24"
                    className="w-full rounded-lg border border-gray-300 py-3 px-3 uppercase outline-none focus:border-black"
                  />
                </div>

                {/* ID */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Identification Number
                  </label>

                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="identificationNumber"
                      value={
                        form.identificationNumber
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Ghana Card / ID number"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                APPROVAL NOTICE
            ================================================== */}

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <strong>
                Rider approval required
              </strong>

              <p className="mt-1">
                After submitting your
                application, BUYUKUSED will
                review your rider information.
                You will not be able to accept
                delivery jobs until your
                account is approved.
              </p>
            </div>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaMotorcycle />

              {loading
                ? "Submitting Application..."
                : "Apply as a Rider"}
            </button>
          </form>

          {/* ===================================================
              LOGIN
          ==================================================== */}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-black hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiderRegister;