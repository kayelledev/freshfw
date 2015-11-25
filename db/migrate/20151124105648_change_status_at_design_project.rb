class ChangeStatusAtDesignProject < ActiveRecord::Migration
  def up
    change_column :shoppe_design_projects, :status, 'integer USING CAST(status AS integer)', default: 0
  end

  def down
    change_column :shoppe_design_projects, :status, :string
  end
end
