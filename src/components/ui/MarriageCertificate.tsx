import * as React from "react";
import { format } from "date-fns";

const MarriageCertificate = ({
  partner1 = "",
  partner2 = "",
  date = new Date(),
  location = "",
  maidOfHonor = "",
  bestMan = "",
  officiant = "",
}) => {
  // Convert date to the required format
  const formattedDate = format(date, "d 'OF' MMMM, yyyy").toUpperCase();
  const formattedLocation = location.toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white">
      <div className="border-8 border-double p-8 relative">
        {/* Ornamental Corners */}
        <svg className="absolute top-0 left-0 w-24 h-24">
          <path
            d="M0 24C0 24 4 24 8 24C12 24 16 20 20 16C24 12 28 8 32 8C36 8 40 12 44 16C48 20 52 24 56 24H0Z"
            fill="none"
            stroke="#4A2328"
            strokeWidth="1.5"
            transform="rotate(135, 24, 24)"
          />
          <path
            d="M8 32C8 32 12 28 16 24C20 20 24 16 28 16C32 16 36 20 40 24C44 28 48 32 52 32"
            fill="none"
            stroke="#4A2328"
            strokeWidth="1.5"
            transform="rotate(135, 24, 24)"
          />
        </svg>
        <svg className="absolute top-0 right-0 w-24 h-24">
          <use href="#corner" transform="scale(-1, 1) translate(-48, 0)" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-24 h-24">
          <use href="#corner" transform="scale(1, -1) translate(0, -48)" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-24 h-24">
          <use href="#corner" transform="scale(-1, -1) translate(-48, -48)" />
        </svg>

        {/* Certificate Content */}
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-serif tracking-wide mb-2">
            CERTIFICATE
          </h1>
          <h2 className="text-3xl font-serif tracking-wide mb-8">
            OF MARRIAGE
          </h2>

          <p className="text-lg font-serif tracking-wide">
            ON THIS DAY, {formattedDate}, IN {formattedLocation}
          </p>

          <div className="flex items-center justify-center space-x-4 text-2xl font-serif my-8">
            <span>{partner1}</span>
            <span>&</span>
            <span>{partner2}</span>
          </div>

          <p className="text-xl font-serif">WERE UNITED IN MARRIAGE</p>

          <p className="text-lg font-serif max-w-2xl mx-auto">
            IN CONFIRMATION AND CELEBRATION OF THIS COMMITMENT THEY SET THEIR
            HANDS BELOW
          </p>

          {/* Banner with Names */}
          <div className="relative my-12">
            <svg className="w-64 h-16 mx-auto">
              <path
                d="M0 8 H240"
                stroke="#4A2328"
                strokeWidth="1"
                fill="none"
              />
              <path d="M120 0 L100 8 H140 L120 0Z" fill="#4A2328" />
              <text
                x="120"
                y="20"
                textAnchor="middle"
                className="font-serif"
                fill="#4A2328"
              >
                {partner1.split(" ")[0]} & {partner2.split(" ")[0]}
              </text>
            </svg>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="space-y-8">
              <div className="border-b border-gray-400 pt-8">
                <p className="text-sm font-serif mt-2">BRIDE</p>
              </div>
              <div className="border-b border-gray-400 pt-8">
                <p className="text-sm font-serif mt-2">MAID OF HONOR</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="border-b border-gray-400 pt-8">
                <p className="text-sm font-serif mt-2">GROOM</p>
              </div>
              <div className="border-b border-gray-400 pt-8">
                <p className="text-sm font-serif mt-2">BEST MAN</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-400 w-48 mx-auto pt-8">
            <p className="text-sm font-serif mt-2">OFFICIANT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarriageCertificate;
