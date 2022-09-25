import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import Image from 'next/future/image';
import { useState } from 'react';
import Stripe from 'stripe';
import axios from 'axios';

import { formatPrice } from '../../helpers/formatPrice.helper';
import { IProduct } from '../../interfaces/IProduct';
import { stripe } from '../../lib/stripe';
import {
  ImageContainer,
  ProductContainer,
  ProductDetails
} from '../../styles/pages/product';
import Head from 'next/head';

type Params = ParsedUrlQuery & {
  slug: string;
}

interface IProductProps {
  product: IProduct;
}

export default function Product({ product }: IProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch (error) {
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout');
    }
  }

  return (
    <>
      <Head>
        <title>Ignite Shop | {product.name}</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={520}
            height={480}
          />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button
            onClick={handleBuyProduct}
            disabled={isCreatingCheckoutSession}
          >
            Comprar Agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await stripe.products.list();

  return {
    paths: data.map(product => ({ params: { slug: product.id } })) || [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params as Params;

  try {
    const product = await stripe.products.retrieve(slug, {
      expand: ['default_price'],
    });

    const productPrice = product.default_price as Stripe.Price;

    return {
      props: {
        product: {
          id: product.id,
          description: product.description,
          imageUrl: product.images[0],
          name: product.name,
          price: formatPrice(productPrice.unit_amount),
          defaultPriceId: productPrice.id,
        }
      },
      revalidate: 60 * 60 * 12 // 12 hours
    };
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    }
  }
};
