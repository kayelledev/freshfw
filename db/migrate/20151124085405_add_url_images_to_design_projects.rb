class AddUrlImagesToDesignProjects < ActiveRecord::Migration
  def change
    add_column :shoppe_design_projects, :url_inspiration_image1, :string
    add_column :shoppe_design_projects, :url_inspiration_image2, :string
    add_column :shoppe_design_projects, :url_inspiration_image3, :string
  end
end
