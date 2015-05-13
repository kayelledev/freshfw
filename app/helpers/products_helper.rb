module ProductsHelper
  def root_product
    @product.parent || @product
  end

  def product_visibility product
    return 'none' if product.has_variants?
    (product.default? || !product.parent)? 'block' : 'none'
  end
end
