import styles from "./page.module.css";
import gameStyles from "@/app/(pages)/cards/[pubName]/page.module.css";
import BuyNowButton from "@/app/components/BuyNowButton/BuyNowButton";
import Image from "next/image";
import Game from "@/app/components/Game/Game";
import prisma from "@/app/utils/db";
import type { Metadata } from "next";
import NotFound from "@/app/(pages)/not-found";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { pubName } = params;
  const product = await prisma.product.findUnique({
    where: {
      pubName: pubName,
      isPublished: true,
    },
    include: {
      owners: {
        select: {
          email: true,
        },
      },
      DemoCard: {},
    },
  });
  if (product) {
    return {
      title: `${product.name} | Drinkify`,
      description: product.description.split("<br>")[0],
      alternates: {
        canonical: `https://drinkify.pl/offer/${product.pubName}`,
      },
    };
  }
}

export const dynamic = "force-dynamic";

export default async function Product({ params }) {
  const { pubName } = params;
  const product = await prisma.product.findUnique({
    where: {
      pubName: pubName,
      isPublished: true,
    },
    include: {
      owners: {
        select: {
          email: true,
        },
      },
      DemoCard: {},
    },
  });

  if (!product) {
    return NotFound();
  }

  const priceValidUntil = new Date();
  priceValidUntil.setDate(priceValidUntil.getDate() + 30);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.thumbnail,
    description: product.description,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: product.price,
      priceCurrency: "PLN",
      priceValidUntil: priceValidUntil.toISOString().split("T")[0],
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "PLN",
        },
        shippingDestination: [
          {
            "@type": "DefinedRegion",
            addressCountry: "*",
            addressRegion: ["*"],
          },
        ],
      },
    },
    brand: {
      "@type": "Brand",
      name: "Drinkify",
    },
  };

  return (
    <>
      <section className={styles.product_section}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div
          style={{
            background: "var(--bg-color)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div className={styles.product_grid_container}>
            <div
              className={`${styles.product_grid_item} ${styles.img_wrapper}`}
            >
              {product.backgroundImg && (
                <Image
                  src={product.backgroundImg}
                  alt="drink"
                  // fill
                  // sizes="(max-width:440px) 100vw, 600px"
                  className="object-contain"
                  width={600}
                  height={600}
                  priority
                />
              )}
            </div>
            <div className={`${styles.product_grid_item} ${styles.details}`}>
              <h1 className={styles.product_title}>{product?.name}</h1>
              <span className={styles.product_price}>{product?.price} zł</span>
              <p
                className={styles.product_description}
                dangerouslySetInnerHTML={{ __html: product?.description }}
              ></p>

              <BuyNowButton product={product} />
            </div>
          </div>
          <div className={styles.custom_shape_divider_bottom_1681672643}>
            <svg
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                className={styles.shape_fill}
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                className={styles.shape_fill}
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                className={styles.shape_fill}
              ></path>
            </svg>
          </div>
        </div>
        <div
          className={gameStyles.game_section}
          style={{
            width: "100%",
            backgroundColor: "#1e0324",
            paddingTop: "10rem",
            height: "120vh",
          }}
        >
          <Game
            cards={product.DemoCard}
            isDemo={true}
            cardImage={product.backgroundImg}
            gameType={product.type}
          />
        </div>
        {product?.rules && (
          <section className={styles.rules_container}>
            <div
              className={styles.rules_inner}
              dangerouslySetInnerHTML={{ __html: product.rules }}
            ></div>
          </section>
        )}
      </section>
    </>
  );
}
