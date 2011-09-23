class ProjectsController < ApplicationController
  before_filter :authenticate, :only => [:new, :create, :edit, :update]
  
  def index
    @projects = Project.find :all
  end
  
  def new
    @project = Project.new
  end
  
  def create
    @project = Project.new(params[:project])
    @project.creation_time = Time.now
    if @project.save
      redirect_to edit_project_path(@project.id), :notice => "<div class='success'>"
    else
      redirect_to edit_project_path(@project.id), :notice => error_listing(@project)
    end
  end
  
  def edit
    @project = Project.find(params[:id])
  end
  
  def show
    @project = Project.find(params[:id])
    @comments = @project.Comments
  end
  
  def update
    @project = Project.find(params[:id])
    @project.authors += ',' + User.find(session[:user_id]).name
    if @project.update_attributes(params[:project])
      flash[:notice] = "<div class='success'>Project Successfully Updated.</div>";
      redirect_to edit_project_path
    else
      flash[:notice] = "<div class='success'>Green, but so sorry. FAILURE!</div>";
      redirect_to edit_project_path
    end
  end
  
end
