import { useKeenSlider } from 'keen-slider/react';
import Image from 'next/future/image';
import { GetStaticProps } from 'next';
import Stripe from 'stripe';

import { HomeContainer, Product } from '../styles/pages/home';
import { IProduct } from '../interfaces/IProduct';
import { stripe } from '../lib/stripe';

import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';

interface IHomeProps {
  products: IProduct[];
}

export default function Home({ products }: IHomeProps) {
  const [sliderRef] = useKeenSlider({
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 48 },
      },
      "(min-width: 1024px)": {
        slides: { perView:3, spacing: 48 },
      },
    },
    slides: { perView: 1, spacing: 48 },
  });

  return (
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map(product => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Product className="keen-slider__slide">
          <Image
            src={product.imageUrl}
            width={520}
            height={480}
            alt={product.name}
          />

          <footer>
            <strong>{product.name}</strong>
            <span>{product.price}</span>
          </footer>
        </Product>
        </Link>
      ))}
    </HomeContainer>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await stripe.products.list({
    expand: ['data.default_price'],
  });


  const products = data.map(product => {
    const price = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      url: product.url,
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount / 100),
    }
  });

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}
