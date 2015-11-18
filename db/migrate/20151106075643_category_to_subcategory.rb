class CategoryToSubcategory < ActiveRecord::Migration
  def change
  	Shoppe::Product.all.each do |product|
  		product.update(product_category_id: product.product_subcategory_id)
  	end
  	remove_column :shoppe_products, :product_subcategory_id
  end
end
