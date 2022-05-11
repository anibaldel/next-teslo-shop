import { useContext, useState } from 'react';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { ShopLayout } from '../../components/layouts';
import { ProductSlideshow, SizeSelector } from '../../components/products';
import { ItemCounter } from '../../components/ui/ItemCounter';
import { ICartProduct, IProduct } from '../../interfaces';
import { GetServerSideProps } from 'next'
import { dbProducts } from '../../database';
import { ISize } from '../../interfaces/products';
import { useRouter } from 'next/router';
import { CartContext } from '../../context';

interface Props {
  product: IProduct
}

const ProductPage:NextPage<Props> = ({product}) => {
  
  // const {products:product, isLoading} = useProducts(`/products/${ router.query.slug}`);
  
  const router = useRouter();

  const { addProductToCart } = useContext(CartContext);

  const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({
    _id: product._id,
    image: product.images[0],
    price: product.price,
    size: undefined,
    slug: product.slug,
    title: product.title,
    gender: product.gender,
    quantity: 1,
  })

  const selectedSize = ( size: ISize) => {
    setTempCartProduct( currentProduct => ({
      ...currentProduct,
      size
    }))
  }

  const onUpdateQuantity=(quantity:number)=> {
    setTempCartProduct( currentProduct => ({
      ...currentProduct,
      quantity
    }))
  }

  const onAddProduct = ()=> {
    if(!tempCartProduct.size) { return; }
    addProductToCart(tempCartProduct);
    // router.push('./cart')


  }

  return (
    <ShopLayout title={ product.title } pageDescription={ product.description }>
    
      <Grid container spacing={3}>

        <Grid item xs={12} sm={ 7 }>
          <ProductSlideshow 
            images={ product.images }
          />
        </Grid>

        <Grid item xs={ 12 } sm={ 5 }>
          <Box display='flex' flexDirection='column'>

            {/* titulos */}
            <Typography variant='h1' component='h1'>{ product.title }</Typography>
            <Typography variant='subtitle1' component='h2'>{ `$${product.price}` }</Typography>

            {/* Cantidad */}
            <Box sx={{ my: 2 }}>
              <Typography variant='subtitle2'>Cantidad</Typography>
              <ItemCounter 
                currentValue= {tempCartProduct.quantity}
                updatedQuantity = {(newValue)=> onUpdateQuantity(newValue)}
                maxValue = {product.inStock > 5 ? 5 : product.inStock}
              />
              <SizeSelector 
                // selectedSize={ product.sizes[2] } 
                sizes={ product.sizes }
                selectedSize={ tempCartProduct.size }
                onSelectedSize = {(size)=> selectedSize(size)}
              />
            </Box>


            {/* Agregar al carrito */}
            {
              (product.inStock > 0)
              ? (
                <Button 
                  color="secondary" 
                  className='circular-btn'
                  onClick={ onAddProduct}
                >
                  {
                    tempCartProduct.size
                    ? 'Agregar al carrito'
                    : 'Seleccione una talla'
                  }
                </Button>
              ): (
                <Chip label="No hay disponibles" color="error" variant='outlined' />
              )
            }

            {/* Descripción */}
            <Box sx={{ mt:3 }}>
              <Typography variant='subtitle2'>Descripción</Typography>
              <Typography variant='body2'>{ product.description }</Typography>
            </Box>

          </Box>
        </Grid>


      </Grid>

    </ShopLayout>
  )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

// export const getServerSideProps: GetServerSideProps = async ({params}) => {
  
//   const {slug =''} = params as {slug: string};

//   const product = await dbProducts.getProductBySlug(slug);

//   if(!product) {
//     return {
//       redirect: {
//         destination: '/',
//         permanent: false
//       }
//     }
//   }

//   return {
//     props: {
//       product
//     }
//   }
// }

// You should use getStaticPaths if you’re statically pre-rendering pages that use dynamic routes

export const getStaticPaths: GetStaticPaths = async (ctx) => {

  const productsSlugs = await dbProducts.getAllProcutsSlugs();

  return {
    paths: productsSlugs.map( ({slug}) => ({
      params: { slug }
    })),
    fallback: 'blocking'
  }
}



export const getStaticProps: GetStaticProps = async ({ params }) => {
  
  const {slug =''} = params as {slug: string};

  const product = await dbProducts.getProductBySlug(slug);

  if(!product) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24
  }
}


export default ProductPage