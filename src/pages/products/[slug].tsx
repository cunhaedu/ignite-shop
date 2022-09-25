import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import Image from 'next/future/image';
import Stripe from 'stripe';

import { formatPrice } from '../../helpers/formatPrice.helper';
import { IProduct } from '../../interfaces/IProduct';
import { stripe } from '../../lib/stripe';
import {
  ImageContainer,
  ProductContainer,
  ProductDetails
} from '../../styles/pages/product';

type Params = ParsedUrlQuery & {
  slug: string;
}

interface IProductProps {
  product: IProduct;
}

export default function Product({ product }: IProductProps) {
  return (
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

        <button>Comprar Agora</button>
      </ProductDetails>
    </ProductContainer>
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

  const product = await stripe.products.retrieve(slug, {
    expand: ['default_price'],
  });

  if (!product) {
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    }
  }

  const productPrice = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        description: product.description,
        imageUrl: product.images[0],
        name: product.name,
        price: formatPrice(productPrice.unit_amount),
      }
    },
    revalidate: 60 * 60 * 12 // 12 hours
  };
};
