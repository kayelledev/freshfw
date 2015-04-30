module ProductsHelper
  def root_product
    @product.parent || @product
  end

  def product_visibility product
    product.parent ? 'none' : 'block'
  end
end
