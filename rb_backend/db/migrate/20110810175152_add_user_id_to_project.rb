class AddUserIdToProject < ActiveRecord::Migration
  def self.up
    add_column :projects, :user_id, :integer
  end

  def self.down
  end
end
